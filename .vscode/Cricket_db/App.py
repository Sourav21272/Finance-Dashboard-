import os
import re
import pdfplumber
from flask import Flask, render_template, request, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secretkey123'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///cricket.db'
app.config['UPLOAD_FOLDER'] = 'uploads'

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

db = SQLAlchemy(app)

# --- DATABASE MODELS ---
class MatchStats(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    match_name = db.Column(db.String(100)) # e.g., "Piyush 10 vs Deep 10"
    player_name = db.Column(db.String(100), nullable=False)
    team_name = db.Column(db.String(100))
    
    # Batting
    runs_scored = db.Column(db.Integer, default=0)
    balls_faced = db.Column(db.Integer, default=0)
    fours = db.Column(db.Integer, default=0)
    sixes = db.Column(db.Integer, default=0)
    is_out = db.Column(db.Boolean, default=True)
    
    # Bowling
    overs_bowled = db.Column(db.Float, default=0.0)
    runs_conceded = db.Column(db.Integer, default=0)
    wickets_taken = db.Column(db.Integer, default=0)

with app.app_context():
    db.create_all()

# --- HELPER: CLEAN NAMES ---
def clean_player_name(raw_name):
    """
    Removes dismissal info like 'b Nonte' or 'not out' from the name.
    Example: 'Kollyan b Nonte' -> 'Kollyan'
    """
    # Split by common dismissal terms
    tokens = re.split(r'\s+(b\s|c\s|lbw|not out|run out)', raw_name, flags=re.IGNORECASE)
    return tokens[0].strip()

# --- THE PARSER LOGIC ---
def parse_pdf_and_save(filepath):
    """
    Parses the specific table format seen in 'Piyush 10 vs Deep 10'.
    """
    current_match_name = "Unknown Match"
    
    with pdfplumber.open(filepath) as pdf:
        # Try to find match name on first page
        first_page_text = pdf.pages[0].extract_text()
        if "v/s" in first_page_text:
            # Example: Extracts "Piyush 10 v/s Deep 10"
            lines = first_page_text.split('\n')
            for line in lines:
                if "v/s" in line:
                    current_match_name = line.strip()
                    break

        # Iterate through all pages to find tables
        for page in pdf.pages:
            tables = page.extract_tables()
            
            for table in tables:
                # We need to identify if a table is BATTING or BOWLING
                # We do this by checking the headers in the first row.
                
                headers = [str(h).lower() for h in table[0] if h is not None]
                
                # --- CASE 1: BATTING TABLE ---
                # Headers usually contain 'batsman', 'r', 'b', 'sr'
                if 'batsman' in headers and 'r' in headers:
                    for row in table[1:]: # Skip header
                        # Ensure row has data
                        if not row[0] or row[0] == "Extras" or row[0] == "Total":
                            continue
                            
                        raw_name = row[0]
                        runs = row[1]
                        balls = row[2]
                        # In your PDF, 4s and 6s might be in varying columns, 
                        # but usually: Name, R, B, SR, 6s, 4s
                        # Based on your data: Kollyan, 8, 14...
                        
                        try:
                            # Save to DB
                            player = MatchStats(
                                match_name=current_match_name,
                                player_name=clean_player_name(raw_name),
                                runs_scored=int(runs) if runs else 0,
                                balls_faced=int(balls) if balls else 0,
                                # We assume 6s is col 4 and 4s is col 5 based on standard formats,
                                # but strictly using R and B for now to be safe.
                                is_out="not out" not in raw_name.lower()
                            )
                            db.session.add(player)
                        except ValueError:
                            continue # Skip bad rows

                # --- CASE 2: BOWLING TABLE ---
                # Headers usually contain 'bowler', 'o', 'm', 'er', 'w', 'r'
                elif 'bowler' in headers:
                    for row in table[1:]:
                        if not row[0]: continue
                        
                        # Based on your text: Name, Overs, Maidens, ER, Runs, Wickets
                        # Example: "Ayush", "2.0", "0", "7.00", "14", "1"
                        # WAIT: In your text, Ayush (row 3) has 14 runs and 1 wicket.
                        # The columns in your text seem to be: Name, O, M, ER, R, W 
                        # OR Name, O, M, ER, W, R. 
                        # Let's check "Deep": 5.00 ER, 5 Runs, 0 Wickets? (5.00 ER matches).
                        # Let's check "Ayush": 7.00 ER, 14 Runs, 1 Wicket. (14/2 = 7.00).
                        # So column index 4 is Runs, index 5 is Wickets.
                        
                        b_name = row[0]
                        overs = row[1]
                        runs_given = row[4]
                        wickets = row[5]
                        
                        try:
                            # check if player exists (he might have batted too)
                            existing_player = MatchStats.query.filter_by(
                                match_name=current_match_name, 
                                player_name=b_name
                            ).first()
                            
                            if existing_player:
                                existing_player.overs_bowled = float(overs)
                                existing_player.runs_conceded = int(runs_given)
                                existing_player.wickets_taken = int(wickets)
                            else:
                                bowler = MatchStats(
                                    match_name=current_match_name,
                                    player_name=b_name,
                                    overs_bowled=float(overs),
                                    runs_conceded=int(runs_given),
                                    wickets_taken=int(wickets)
                                )
                                db.session.add(bowler)
                        except ValueError:
                            continue

    db.session.commit()

# --- ROUTES ---
@app.route('/')
def index():
    records = MatchStats.query.all()
    return render_template('index.html', records=records)

@app.route('/upload', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        if 'file' not in request.files:
            flash('No file part')
            return redirect(request.url)
        file = request.files['file']
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)
        if file:
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            try:
                parse_pdf_and_save(filepath)
                flash('Scorecard processed successfully!')
            except Exception as e:
                flash(f'Error: {str(e)}')
            return redirect(url_for('index'))
    return render_template('upload.html')

if __name__ == '__main__':
    app.run(debug=True)