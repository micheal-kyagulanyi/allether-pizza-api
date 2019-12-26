const express = require('express');
const router = express.Router();

var cronController = require('./../controllers/cronController');

// POST: Create an Order cron job
router.post('/create', cronController.createCronJob);

module.exports = router;