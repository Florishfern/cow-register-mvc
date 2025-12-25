const express = require('express');
const router = express.Router();
const cowController = require('../controllers/cowController');

router.get('/', cowController.showHome);
router.post('/choose-color', cowController.chooseColor);

router.get('/register/:color', cowController.showRegisterForm);
router.post('/register/:color', cowController.registerCowWeb);

router.get('/summary', cowController.showSummary);

module.exports = router;
