const express = require('express');
const router = express.Router();


// Get all the helper functions
var {paginatedResults} = require('./../helpers');
// To help in pagination. Need to clean this up, don't want to get models here
var {Order} = require('./../model/order');
var orderController = require('./../controllers/orderController');

// GET: Display welcom message
router.get('/', (req, res) => {
    res.send("Welcome");
});

// GET:  Display list of paginated orders
router.get('/orders', paginatedResults(Order), orderController.getAllOrders);

// GET: Display orders stats
router.get('/orders/stats', orderController.getAllOrdersStats);

// GET: Display a specific order by _id
router.get('/order/:order_id', orderController.getOrderById);

// GET: Display a specific order status by _id
router.get('/order/:order_id/status', orderController.getOrderStatusById);


// POST: Create an Order
router.post('/order/create', orderController.createOrder);

//PATCH: Find Order by _id and update 
router.patch('/order/:order_id/update', orderController.findOrderByIdAndUpdate);

module.exports = router;