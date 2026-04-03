const path = require('path');
const express = require('express');
const http = require('http');
const session = require('express-session');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const User = require('./models/User');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chat_demo';
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(()=>console.log('MongoDB connected'))
	.catch(err=>console.error('MongoDB error', err));

app.use(express.json());
app.use(session({
	secret: process.env.SESSION_SECRET || 'devsecret',
	resave: false,
	saveUninitialized: true,
	cookie: { secure: false }
}));

// static files
app.use(express.static(path.join(__dirname)));
app.use('/public', express.static(path.join(__dirname, 'public')));

// API: login (create account if not exists)
app.post('/api/login', async (req, res) => {
	const { username, password } = req.body || {};
	if (!username || !password) return res.status(400).send('username and password required');
	let user = await User.findOne({ username });
	if (!user) {
		const hash = await bcrypt.hash(password, 10);
		user = await User.create({ username, passwordHash: hash });
	}
	const ok = await bcrypt.compare(password, user.passwordHash);
	if (!ok) return res.status(401).send('invalid credentials');
	req.session.userId = user._id.toString();
	res.json({ success: true });
});

// api to get current user
app.get('/api/user', async (req, res) => {
	if (!req.session.userId) return res.status(401).send('not logged in');
	const user = await User.findById(req.session.userId).lean();
	if (!user) return res.status(401).send('user not found');
	res.json({ id: user._id.toString(), username: user.username });
});

// get last messages
app.get('/api/messages', async (req, res) => {
	const msgs = await Message.find().sort({ createdAt: 1 }).limit(500).lean();
	res.json(msgs.map(m => ({
		id: m._id.toString(),
		text: m.text,
		senderId: m.senderId,
		senderName: m.senderName,
		createdAt: m.createdAt
	})));
});

// simple in-memory online map
const online = new Map();

io.on('connection', (socket) => {
	let user = null;

	socket.on('join', (u) => {
		// minimal validation
		user = { id: u.id || uuidv4(), username: u.username || 'Anon' };
		online.set(socket.id, user);
		io.emit('online', Array.from(online.values()).map(x => ({ id: x.id, username: x.username })));
	});

	socket.on('message', async (data) => {
		if (!user) return;
		const text = String(data.text || '').trim();
		if (!text) return;
		const msg = await Message.create({
			text,
			senderId: user.id,
			senderName: user.username,
			createdAt: new Date()
		});
		const out = { id: msg._id.toString(), text: msg.text, senderId: msg.senderId, senderName: msg.senderName, createdAt: msg.createdAt };
		io.emit('message', out);
	});

	socket.on('disconnect', () => {
		if (user) {
			online.delete(socket.id);
			io.emit('online', Array.from(online.values()).map(x => ({ id: x.id, username: x.username })));
		}
	});
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
