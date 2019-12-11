const express = require('express');
const router = express.Router();
var {ObjectID} = require('mongodb');
const {Promise} = require('bluebird');

var {Order} = require('./../model/order');
var {updateCrustSize} = require('./../model/crustsize');
var {Meat} = require('./../model/meat');
var {FlavoredCrust} = require('./../model/flavoredcrust');
var {updateSauce} = require('./../model/sauce');
var {Drink} = require('./../model/drink');
var {Topping} = require('./../model/topping');
var {getSum} = require('./../helpers');

router.get('/', (req, res) => {
    // List the orders
    Order.find({}).then(
        (orders) => {
            res.send(orders);
        }
    );
});


router.post('/create', (req, res) => {
    // Create order
    var insertOrder = {};
    insertOrder._id = new ObjectID();
    insertOrder.name = req.body.name;
    insertOrder.ipAddress = req.connection.remoteAddress;
    insertOrder.orderTime = Date.now();
    insertOrder.deliveryStatus = req.body.deliveryStatus;
    insertOrder.totalPrice = 0;
    insertOrder.totalQuantity = 0;
    insertOrder.pizzas = [];

    // Process all the pizzas from the incoming order
    var orderPizzas = new Array();
    orderPizzas = req.body.pizzas;
     // Global variable to hold all the pizzas on the order        
    toSavePizzas = [];
    var i = 0;
    // Update each pizza with db info
    orderPizzas.forEach(orderPizza => {
        toSavePizza = {};
        Promise.all(
            [
                updateCrustSize(orderPizza),
                updateSauce(orderPizza)
            ]
        )
        .spread((crust, sauces) => {
            // This promise only runs once for the whole loop
            // Need to research about this
            console.log('Crust: ',crust);
            console.log('Sauces: ',sauces);
        });
    }); // End orderPizzas.forEach i.e updating @ pizza
     
   
});

module.exports = router;