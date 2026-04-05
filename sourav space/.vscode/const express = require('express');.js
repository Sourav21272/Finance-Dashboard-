const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const pdf = require('pdf-parse');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');

// 1. Setup
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const upload = multer({ dest: 'uploads/' });

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// 2. Database Schema (MongoDB)
mongoose.connect('mongodb://localhost:27017/cricketDB');

const playerSchema = new mongoose.Schema({
    name: String,
    category: String, // Batsman, Bowler, All-rounder
    pastStats: { runs: Number, wickets: Number }, // Manual Input
    presentStats: { runs: Number, wickets: Number }, // From PDF
    totalScore: Number // Calculated for Ranking
});

const Player = mongoose.model('Player', playerSchema);

// 3. PDF Parsing Logic (The "Smart" Part)
// Assumes PDF text format is simple line-by-line: "Runs: 50"
async function parseStatsFromPDF(filePath) {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    const text = data.text;
    
    // Simple logic: Extract numbers after keywords (Basic Example)
    // You would make this smarter based on your actual PDF format
    const runsMatch = text.match(/Runs:\s*(\d+)/);
    const wicketsMatch = text.match(/Wickets:\s*(\d+)/);
    
    return {
        runs: runsMatch ? parseInt(runsMatch[1]) : 0,
        wickets: wicketsMatch ? parseInt(wicketsMatch[1]) : 0
    };
}

// 4. Routes

// Home: Input Form
app.get('/', (req, res) => {
    res.render('index');
});

// Admin: Add Player & Upload PDF
app.post('/add-player', upload.single('statsPdf'), async (req, res) => {
    const { name, category, pastRuns, pastWickets } = req.body;
    
    // Parse PDF for present stats
    let presentStats = { runs: 0, wickets: 0 };
    if (req.file) {
        presentStats = await parseStatsFromPDF(req.file.path);
        // Clean up uploaded file
        fs.unlinkSync(req.file.path);
    }

    // Calculate generic score for ranking (Example: Runs + Wickets * 20)
    const totalScore = (parseInt(pastRuns) + presentStats.runs) + 
                       ((parseInt(pastWickets) + presentStats.wickets) * 20);

    const newPlayer = new Player({
        name,
        category,
        pastStats: { runs: pastRuns, wickets: pastWickets },
        presentStats,
        totalScore
    });

    await newPlayer.save();
    
    // Trigger Real-Time Update
    io.emit('rankingUpdate', await getRankings());
    
    res.redirect('/rankings');
});

// View Rankings
app.get('/rankings', async (req, res) => {
    const players = await getRankings();
    res.render('rankings', { players });
});

// Helper: Get sorted players
async function getRankings() {
    return await Player.find().sort({ totalScore: -1 }); // Descending order
}

server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});