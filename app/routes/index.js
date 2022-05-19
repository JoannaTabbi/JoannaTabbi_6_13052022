const express = require('express');
const router = express.Router();
const userRoutes = require('./user');
const sauceRoutes = require('./sauce');
const path = require('path');

// route for users / sauces
router.use('/auth', userRoutes);
router.use('/sauces', sauceRoutes);
router.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = router;