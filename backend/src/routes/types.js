const express = require('express');
const router = express.Router();

// Placeholder route
router.get('/', (req, res) => {
  res.json({ message: 'Types route placeholder' });
});

module.exports = router; 