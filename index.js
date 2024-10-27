const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const User = require('./models/User'); // Ensure correct path to User model

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false,
}));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/bank-db', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(error => console.error('Error connecting to MongoDB:', error));

// Routes

// Register endpoint
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = new User({ username, password });
        await user.save();
        res.redirect('/login.html');
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Error registering user');
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).send('Invalid username or password');
        }

        req.session.userId = user._id;
        res.redirect(`/welcome.html?username=${user.username}`);
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send('Error logging in');
    }
});

// Transfer money endpoint
app.post('/transfer', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).send('Unauthorized');
    }

    const { recipientUsername, amount } = req.body;
    const amountNumber = parseFloat(amount);

    try {
        const senderUser = await User.findById(req.session.userId);
        const recipientUser = await User.findOne({ username: recipientUsername });

        if (!senderUser || !recipientUser) {
            return res.status(400).send('Sender or recipient not found');
        }

        if (senderUser.balance < amountNumber) {
            return res.status(400).send('Insufficient balance');
        }

        senderUser.balance -= amountNumber;
        recipientUser.balance += amountNumber;

        const transaction = {
            amount: amountNumber,
            fromAccount: senderUser.username,
        };

        senderUser.transactions.push(transaction);
        recipientUser.transactions.push(transaction);

        await senderUser.save();
        await recipientUser.save();

        res.send('Money transferred successfully');
    } catch (error) {
        console.error('Error transferring money:', error);
        res.status(500).send('An error occurred while transferring money');
    }
});

// Get user data including balance and transactions
app.get('/api/userData', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).send('Unauthorized');
        }

        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).send('User not found');
        }

        const userData = {
            username: user.username,
            balance: user.balance,
            transactions: user.transactions,
        };

        res.json(userData);
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).send('Error fetching user data');
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
