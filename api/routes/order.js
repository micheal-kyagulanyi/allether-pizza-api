const express = require('express');
const router = express.Router();
var {ObjectID} = require('mongodb');
const {Promise} = require('bluebird');

var {Order} = require('./../model/order');
var {updateCrustSize} = require('./../model/crustsize');
var {updatedMeats} = require('./../model/meat');
var {updatedFlavoredCrusts} = require('./../model/flavoredcrust');
var {updatedSauces} = require('./../model/sauce');
var {updatedDrinks} = require('./../model/drink');
var {updatedToppings} = require('./../model/topping');
var {totalCal, totalPrice, paginatedResults} = require('./../helpers');

router.get('/orders', paginatedResults(Order), (req, res) => {
    res.json(res.paginatedResults);
});

router.get('/orders/:order_id', (req, res) => {
    var order_id = req.params.order_id;
    // Is the order_id valid
    if(!ObjectID.isValid(order_id)){
        return res.status(404).send();
    }

    Order.findById(order_id)
    .then((Order) => {
        // Does the order exist
        if(!Order){
            return res.status(404).send();
        }
        res.send({Order});
    })
    .catch((e) => {
        res.status(400).send();
    });
});


router.post('/order/create', (req, res) => {
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
    var orderPizzas = [];
    orderPizzas = req.body.pizzas;
     // Global variable to hold all the pizzas on the order        
    toSavePizzas = [];


    Promise.map(orderPizzas, (pizza) => {
        // Process each pizza
        return new Promise(
            (resolve, reject) => {
                Promise.all(
                    [
                        updateCrustSize(pizza),
                        updatedMeats(pizza.meats),
                        updatedToppings(pizza.otherToppings),
                        updatedSauces(pizza.sauceOptions),
                        updatedDrinks(pizza.drinks),
                        updatedFlavoredCrusts(pizza.flavoredCrusts)
                    ]
                )
                .spread(
                    (crustSize, meats, otherToppings, sauceOptions, drinks, flavoredCrusts) => {
                    // Update this pizza's info
    
                    // Update toSavePizza with updated info
                    var toSavePizza = {};
                    toSavePizza.price = 0;
                    toSavePizza.calCount = 0;

                    toSavePizza.cookOptions = pizza.cookOptions;
                    
                    if(crustSize !== undefined){
                        toSavePizza.updateCrustSize = crustSize;
                        toSavePizza.price += crustSize.price;
                        toSavePizza.calCount += crustSize.calCount;
                    } 
    
                    if(meats.length > 0){
                        toSavePizza.meats = meats; 
                        toSavePizza.price += totalPrice(meats);
                        toSavePizza.calCount += totalCal(meats);
                    }
    
                    if(otherToppings.length > 0){
                        toSavePizza.otherToppings = otherToppings;
                        toSavePizza.price += totalPrice(otherToppings);
                        toSavePizza.calCount += totalCal(otherToppings);
                    }
    
                    if(sauceOptions.length > 0){
                        toSavePizza.sauceOptions = sauceOptions;
                        toSavePizza.price += totalPrice(sauceOptions);
                        toSavePizza.calCount += totalCal(sauceOptions);
                    }
    
                    if(drinks.length > 0){
                        toSavePizza.drinks = drinks;
                        toSavePizza.price += totalPrice(drinks);
                    }
    
                    if(flavoredCrusts.length > 0){
                        toSavePizza.flavoredCrusts = flavoredCrusts;
                        toSavePizza.price += totalPrice(flavoredCrusts);
                        toSavePizza.calCount += totalCal(flavoredCrusts);
                    }

                    // Push each updated pizza's promise to the array
                    resolve(toSavePizza);
                }); 
            }
        );
    })
    .then((updatedPizzas) => {
        // Update the order with all the pizza info
        updatedPizzas.forEach(pizza => {
            insertOrder.totalPrice += pizza.price;
            insertOrder.pizzas.push(pizza);
            insertOrder.totalQuantity += 1;
        });
        // Create Order in the DB
        Order.create(insertOrder, (err, createdOrder) => {
            if(err){
                return handleError(err);
            }
            res.json(createdOrder);
        });
    }); 
});

module.exports = router;