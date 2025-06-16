
// ✅ server.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');
const User = require('./models/user');

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.use(session({
  secret: 'mysecretkey',
  resave: false,
  saveUninitialized: false
}));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));

// Authentication Middleware
app.use(async (req, res, next) => {
  if (req.session.user) {
    req.user = await User.findById(req.session.user._id);
  }
  next();
});

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const postRoutes = require('./routes/post');
const indexRoutes = require('./routes/index');
app.use('/', indexRoutes);
app.use('/', authRoutes);
app.use('/', userRoutes);
app.use('/', postRoutes);

app.get('/profile', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const user = await User.findById(req.session.user._id).populate('followers').populate('following');
  res.render('profile', { user });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
