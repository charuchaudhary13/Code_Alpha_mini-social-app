// feed route
const express = require('express');
const router = express.Router();

// Show welcome page
router.get('/', (req, res) => {
  res.render('welcome');
});

module.exports = router;
