const express = require('express');
const router = express.Router();
const userRoutes = require('./user');
const sauceRoutes = require('./sauce');

// common paths for users routes / sauces routes / image files
router.use('/auth', userRoutes);
router.use('/sauces', sauceRoutes);

module.exports = router;