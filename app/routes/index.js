const express = require('express');
const router = express.Router();
const userRoutes = require('./user');
const sauceRoutes = require('./sauce');
const path = require('path');

// common paths for users routes / sauces routes / image files
router.use('/auth', userRoutes);
router.use('/sauces', sauceRoutes);
router.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = router;