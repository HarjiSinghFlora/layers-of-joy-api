const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getProfile } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');

// PUBLIC ROUTES
router.post('/register', registerUser);
router.post('/login', loginUser);

// PRIVATE ROUTE
router.get('/profile', protect, getProfile);

module.exports = router;