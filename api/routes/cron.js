const express = require('express');
const router = express.Router();

var cronController = require('./../controllers/cronController');

// GET: List all the cron jobs
router.get('/', cronController.getAllCronJobs);

// POST: Create an Order cron job
router.post('/create', cronController.createCronJob);

// PATCH: Create an Order cron job
router.patch('/:cron_id/stop', cronController.stopCronJob);

module.exports = router;