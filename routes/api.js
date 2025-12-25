const express = require('express');
const router = express.Router();
const cowController = require('../controllers/cowController');

router.post('/cows/:color', cowController.registerCowApi);
router.get('/farms/summary', cowController.getFarmSummaryApi);

module.exports = router;
