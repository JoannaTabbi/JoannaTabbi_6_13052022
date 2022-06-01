const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');
const auth = require('../middleware/auth');

/**
 * searche for the specified sauce routes 
 * and methods given in the request, then call the callback functions
 * that match the request (read one, read all, create etc...)
 */

router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);
router.get('/:id', auth, userCtrl.readUser);
router.get('/export/:id', auth, userCtrl.exportData);
router.put('/:id', auth, userCtrl.updateUser);
router.delete('/:id', auth, userCtrl.deleteUser);
router.post('/report/:id', auth, userCtrl.reportUser);

module.exports = router;