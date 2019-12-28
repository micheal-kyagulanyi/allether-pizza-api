const express = require('express');
const router = express.Router();

var indexController = require('./../controllers/indexController');

// GET: List all orders
router.get('/', indexController.getAllOrders);

module.exports = router;