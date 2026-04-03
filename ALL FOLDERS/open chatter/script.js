(() => {
	const loginView = document.getElementById('loginView');
	const chatView = document.getElementById('chatView');
	const loginForm = document.getElementById('loginForm');
	const usernameInput = document.getElementById('username');
	const passwordInput = document.getElementById('password');
	const loginMsg = document.getElementById('loginMsg');

	const msgForm = document.getElementById('msgForm');
	const msgInput = document.getElementById('msgInput');
	const messagesEl = document.getElementById('messages');
	const onlineList = document.getElementById('onlineList');
	const meInfo = document.getElementById('meInfo');

	let socket = null;
	let me = null;

	function el(tag, text, cls) {
		const e = document.createElement(tag);
		if (text) e.textContent = text;
		if (cls) e.className = cls;
		return e;
	}

	async function fetchJson(url, opts) {
		const res = await fetch(url, opts);
		if (!res.ok) throw new Error(await res.text());
		return res.json();
	}

	async function loadMessages() {
		const msgs = await fetchJson('/api/messages');
		messagesEl.innerHTML = '';
		msgs.forEach(addMessage);
		messagesEl.scrollTop = messagesEl.scrollHeight;
	}

	function addMessage(m) {
		const li = el('li', null, m.senderId === me.id ? 'msg-me' : 'msg-other');
		const who = el('div', m.senderName + (m.senderId === me.id ? ' (you)' : ''), 'muted');
		const txt = el('div', m.text);
		const time = el('div', new Date(m.createdAt).toLocaleTimeString(), 'muted');
		li.appendChild(who);
		li.appendChild(txt);
		li.appendChild(time);
		messagesEl.appendChild(li);
	}

	function setOnlineUsers(list) {
		onlineList.innerHTML = '';
		list.forEach(u => {
			const li = el('li', u.username + (u.id === me.id ? ' (you)' : ''));
			onlineList.appendChild(li);
		});
	}

	loginForm.addEventListener('submit', async (e) => {
		e.preventDefault();
		loginMsg.textContent = 'Logging in...';
		try {
			const res = await fetch('/api/login', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ username: usernameInput.value.trim(), password: passwordInput.value })
			});
			if (!res.ok) throw new Error(await res.text());
			loginMsg.textContent = '';
			// fetch user info
			me = await fetchJson('/api/user');
			meInfo.textContent = `Logged in as ${me.username}`;
			loginView.classList.add('hidden');
			chatView.classList.remove('hidden');
			await loadMessages();
			connectSocket();
		} catch (err) {
			loginMsg.textContent = err.message || 'Login failed';
		}
	});

	function connectSocket() {
		socket = io();
		socket.on('connect', () => {
			socket.emit('join', { id: me.id, username: me.username });
		});
		socket.on('message', (m) => {
			addMessage(m);
			messagesEl.scrollTop = messagesEl.scrollHeight;
		});
		socket.on('online', (list) => setOnlineUsers(list));
	}

	msgForm.addEventListener('submit', async (e) => {
		e.preventDefault();
		const text = msgInput.value.trim();
		if (!text) return;
		// emit via socket (server will persist)
		socket.emit('message', { text });
		msgInput.value = '';
	});
})();
