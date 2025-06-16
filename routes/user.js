const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/user');

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/images'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Upload route
router.post('/upload-profile-pic', upload.single('profilePic'), async (req, res) => {
  try {
    if (!req.user) return res.status(401).send('Unauthorized');

    const ext = path.extname(req.file.originalname);
    const newFilename = req.user._id + '-profile' + ext;
    const newPath = path.join('public/images', newFilename);

    fs.renameSync(req.file.path, newPath);
    const imagePath = '/images/' + newFilename;

    await User.findByIdAndUpdate(req.user._id, { profilePic: imagePath });

    res.redirect('/profile');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error uploading profile picture');
  }
});

module.exports = router;
