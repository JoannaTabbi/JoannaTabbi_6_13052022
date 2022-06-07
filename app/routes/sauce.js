const express = require('express');
const router = express.Router();
const sauceCtrl = require('../controllers/sauce');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

/**
 * searche for the specified sauce routes 
 * and methods given in the request, then call the callback functions
 * that match the request (read one, read all, create etc...)
 */
router.get("/:id", auth, sauceCtrl.readOneSauce);
router.get("/", auth, sauceCtrl.readAllSauces);
router.post("/", auth, multer, sauceCtrl.createSauce);
router.post("/:id/like", auth, sauceCtrl.likeSauce);
router.put("/:id", auth, multer, sauceCtrl.updateSauce);
router.delete("/:id", auth, sauceCtrl.deleteSauce);
router.post('/:id/report', auth, sauceCtrl.reportSauce);


module.exports = router;