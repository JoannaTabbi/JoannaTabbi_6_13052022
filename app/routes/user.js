const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');
const auth = require('../middleware/auth');
const password = require('../middleware/password');
const rateLimiter = require('../middleware/rate-limiter');

/**
 * searche for the specified sauce routes 
 * and methods given in the request, then call the callback functions
 * that match the request (read one, read all, create etc...)
 */

router.post('/signup', password, userCtrl.signup);
router.post('/login', rateLimiter, userCtrl.login);
router.get('/', auth, userCtrl.readUser);
router.get('/export', auth, userCtrl.exportData);
router.put('/', auth, userCtrl.updateUser);
router.delete('/', auth, userCtrl.deleteUser);
router.post('/:id/report', auth, userCtrl.reportUser);

module.exports = router;