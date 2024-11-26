const express = require('express'); 
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

// Initialize express
const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // Enable CORS
app.use(bodyParser.json()); // Parse JSON requests

// Serve static files from 'public' folder
app.use(express.static(path.join(__dirname, '../public')));

// Dummy user data for demonstration (replace this with a database later)
const users = [
    { username: 'user1', password: bcrypt.hashSync('password1', 10) },
    { username: 'user2', password: bcrypt.hashSync('password2', 10) }
];

// Secret key for JWT
const SECRET_KEY = 'your_jwt_secret_key';

// Serve the login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

// Handle login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const user = users.find(u => u.username === username);
    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid password' });
    }

    const token = jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
});

// Protect the dashboard route
app.get('/dashboard', (req, res) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // Use the Bearer prefix
    const bearerToken = token.split(' ')[1];

    try {
        const decoded = jwt.verify(bearerToken, SECRET_KEY);
        res.json({ message: `Welcome ${decoded.username}, you have access to the dashboard.` });
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});







