 const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Show register form
router.get('/register', (req, res) => {
res.render('register');
});

// Register user (plain text password, no uniqueness check)
router.post('/register', async (req, res) => {
const { username, email, password } = req.body;

try {
const newUser = new User({ username, email, password });
await newUser.save();
res.redirect('/login');
} catch (err) {
console.error(err);
res.send('❌ Registration error. Please try again.');
}
});

// Show login form
router.get('/login', (req, res) => {
res.render('login');
});

// Login user (plain text password check)
router.post('/login', async (req, res) => {
const { email, password } = req.body;

try {
const user = await User.findOne({ email });
if (!user) return res.send('❌ User not found.');


if (user.password !== password) {
  return res.send('❌ Invalid password.');
}

req.session.user = {
  _id: user._id,
  username: user.username,
  email: user.email
};

res.redirect('/profile');
} catch (err) {
console.error(err);
res.send('❌ Login error. Please try again.');
}
});

// Logout
router.get('/logout', (req, res) => {
req.session.destroy(() => {
res.redirect('/login');
});
});

module.exports = router;