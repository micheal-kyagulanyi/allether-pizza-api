const express = require('express');
const router = express.Router();
var {ObjectID} = require('mongodb');
const {Promise} = require('bluebird');

var {Order} = require('./../model/order');
var {updateCrustSize} = require('./../model/crustsize');
var {updateMeat} = require('./../model/meat');
var {updateFlavoredCrust} = require('./../model/flavoredcrust');
var {updateSauce} = require('./../model/sauce');
var {updateDrink} = require('./../model/drink');
var {updateOtherTopping} = require('./../model/topping');
var {totalCal, totalPrice} = require('./../helpers');

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
    //insertOrder._id = new ObjectID();
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
    
    orderPizzas.forEach(pizza => {
        Promise.all(
            [
                updateCrustSize(pizza),
                updateSauce(pizza),
                updateMeat(pizza),
                updateFlavoredCrust(pizza),
                updateOtherTopping(pizza),
                updateDrink(pizza)
            ])
        .spread((crust, sauces, meats, flavoredCrusts, otherToppings, drinks) => {
            // Update toSavePizza with updated info
            var toSavePizza = {};
            toSavePizza.price = 0;
            toSavePizza.calCount = 0;

            // Update cook options

            if(crust !== undefined){
                toSavePizza.updateCrustSize = crust;
                toSavePizza.price += crust.price;
                toSavePizza.calCount += crust.calCount;
            } 

            if(sauces.length > 0){
                toSavePizza.sauceOptions = sauces;
            }

            if(meats.length > 0){
                toSavePizza.meats = meats; 
                toSavePizza.price += totalPrice(meats);
                toSavePizza.calCount += totalCal(meats);
            }

            if(flavoredCrusts.length > 0){
                toSavePizza.flavoredCrusts = flavoredCrusts;
                toSavePizza.price += totalPrice(flavoredCrusts);
                toSavePizza.totalCal += totalCal(flavoredCrusts);
            }

            if(otherToppings.length > 0){
                toSavePizza.otherToppings = otherToppings;
                toSavePizza.price += totalPrice(otherToppings);
                toSavePizza.calCount += totalCal(otherToppings);
            }

            if(drinks.length > 0){
                toSavePizza.drinks = drinks;
                toSavePizza.price += totalPrice(drinks);
            }

            // Add each updated pizza to the order
            // Update overall insert order
            insertOrder.totalPrice += toSavePizza.price;
            insertOrder.totalQuantity += 1;
            insertOrder.pizzas.push(toSavePizza);
            
            if(insertOrder.totalQuantity == orderPizzas.length){
                res.json(insertOrder);
            }
        })
    });
});

module.exports = router;