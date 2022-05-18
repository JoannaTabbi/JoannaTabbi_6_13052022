const express = require('express');
const router = express.Router();
const userRoutes = require('./user');
const sauceRoutes = require('./sauce');

// route for users / sauces
router.use('/auth', userRoutes);
router.use('/sauces', sauceRoutes);

module.exports = router;