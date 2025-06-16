const express = require('express');
const router = express.Router();

const multer = require('multer');
const path = require('path');
const Post = require('../models/post');
const User = require('../models/user');

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// ✅ GET /feed
router.get('/feed', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author')
      .populate('comments.user')
      .sort({ createdAt: -1 });

    const user = await User.findById(req.session.user._id);

    res.render('feed', { posts, user });
  } catch (err) {
    console.error('Error loading feed:', err);
    res.status(500).send('Error loading feed');
  }
});

// ✅ POST /create-post
router.post('/create-post', upload.single('image'), async (req, res) => {
  try {
    const post = new Post({
      image: '/uploads/' + req.file.filename,
      caption: req.body.caption,
      author: req.session.user._id
    });
    await post.save();
    res.redirect('/feed');
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).send('Error creating post');
  }
});

// ✅ POST /like/:id
router.post('/like/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const userId = req.session.user._id;

    if (!post) return res.status(404).send('Post not found');

    const alreadyLiked = post.likes.includes(userId);
    if (alreadyLiked) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.redirect('/feed');
  } catch (err) {
    console.error('Error liking post:', err);
    res.status(500).send('Error liking post');
  }
});

// ✅ POST /comment/:id
router.post('/comment/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).send('Post not found');

    post.comments.push({
      user: req.session.user._id,
      text: req.body.comment
    });

    await post.save();
    res.redirect('/feed');
  } catch (err) {
    console.error('Error commenting:', err);
    res.status(500).send('Error commenting on post');
  }
});

// ✅ POST /follow/:id
router.post('/follow/:id', async (req, res) => {
  try {
    const currentUser = await User.findById(req.session.user._id);
    const targetUser = await User.findById(req.params.id);

    if (!targetUser || !currentUser) return res.status(404).send('User not found');

    const isFollowing = currentUser.following.includes(targetUser._id);

    if (isFollowing) {
      currentUser.following.pull(targetUser._id);
      targetUser.followers.pull(currentUser._id);
    } else {
      currentUser.following.push(targetUser._id);
      targetUser.followers.push(currentUser._id);
    }

    await currentUser.save();
    await targetUser.save();

    res.redirect('/feed');
  } catch (err) {
    console.error('Error following/unfollowing user:', err);
    res.status(500).send('Error following/unfollowing user');
  }
});
const fs = require('fs');
// const path = require('path');

// ✅ POST /delete-post/:id
router.post('/delete-post/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).send('Post not found');

    if (post.author.toString() !== req.session.user._id) {
      return res.status(403).send('Unauthorized');
    }

    // Remove image file if exists
    const filePath = path.join(__dirname, '..', 'public', post.image);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Post.findByIdAndDelete(req.params.id);
    res.redirect('/feed');
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).send('Error deleting post');
  }
});


module.exports = router;
