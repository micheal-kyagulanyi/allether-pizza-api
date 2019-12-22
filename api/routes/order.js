const express = require('express');
const _ = require('lodash');
require('deepdash')(_); 
const router = express.Router();

const {ObjectID} = require('mongodb');
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

router.get('/order/:order_id', (req, res) => {
    var order_id = req.params.order_id;
    // Is the order_id valid
    if(!ObjectID.isValid(order_id)){
        return res.status(400).send();
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
    insertOrder.orderName = req.body.orderName;
    insertOrder.ipAddress = req.connection.remoteAddress;
    insertOrder.orderTime = Date.now();
    insertOrder.deliveryStatus = req.body.deliveryStatus;
    insertOrder.totalPrice = 0;
    insertOrder.totalQuantity = 0;
    insertOrder.pizzas = [];

    // List to hold pizza from the order
    var orderPizzas = [];
    // Store orders pizzas into this list
    orderPizzas = req.body.pizzas;

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
                    toSavePizza.slices = 0;

                    toSavePizza.cookOptions = pizza.cookOptions;
                    
                    if(crustSize !== undefined){
                        console.log(crustSize);
                        // Is the error propery set
                        if(crustSize.error){
                            return res.status(404).send({crustSize});
                        }
                        toSavePizza.crustSize = crustSize;
                        toSavePizza.price += crustSize.price;
                        toSavePizza.calCount += crustSize.calCount;
                        toSavePizza.slices += crustSize.slices;
                    } 
    
                    if(meats.length > 0){
                        // Check if there is any error in the meats list
                        const meatErr = meats.find((item) => {
                            return item.error !== undefined;
                        });

                        if(meatErr){
                            // Send error back to the user
                            return res.status(404).send({meatsErr});
                        }
                        toSavePizza.meats = meats; 
                        toSavePizza.price += totalPrice(meats);
                        toSavePizza.calCount += totalCal(meats);
                    }
    
                    if(otherToppings.length > 0){
                        // Check if there is any error in the toppings
                        const otherToppingErr = otherToppings.find((item) => {
                            return item.error !== undefined;
                        });

                        if(otherToppingErr){
                            // Display the err
                            return res.status(404).send({otherToppingErr});
                        }
                        toSavePizza.otherToppings = otherToppings;
                        toSavePizza.price += totalPrice(otherToppings);
                        toSavePizza.calCount += totalCal(otherToppings);
                    }
    
                    if(sauceOptions.length > 0){
                        // Check if there is any error in the meats list
                        const sauceOptionErr = sauceOptions.find((item) => {
                            return item.error !== undefined;
                        });

                        if(sauceOptionErr){
                            // Display the err
                            return res.status(404).send({sauceOptionErr});
                        }
                        toSavePizza.sauceOptions = sauceOptions;
                        toSavePizza.price += totalPrice(sauceOptions);
                        toSavePizza.calCount += totalCal(sauceOptions);
                    }
    
                    if(drinks.length > 0){
                         // Check if there is any error in the meats list
                         const drinkErr = drinks.some((item) => {
                            return item.error !== undefined;
                        });

                        if(drinkErr){
                            // Display the err
                            return res.status(404).send({drinksErr});
                        }
                        toSavePizza.drinks = drinks;
                        toSavePizza.price += totalPrice(drinks);
                    }
    
                    if(flavoredCrusts.length > 0){
                         // Check if there is any error in the meats list
                         const flavoredCrustErr = flavoredCrusts.some((item) => {
                            return item.error !== undefined;
                        });

                        if(flavoredCrustErr){
                            return res.status(404).send({flavoredCrustErr});
                        }
                        toSavePizza.flavoredCrusts = flavoredCrusts;
                        toSavePizza.price += totalPrice(flavoredCrusts);
                        toSavePizza.calCount += totalCal(flavoredCrusts);
                    }

                    // Push each updated pizza's promise to the array
                    console.log(toSavePizza);
                    console.log('----------------End Pizza------------------------------');
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
                return console.log(err);
            }
            res.json(createdOrder);
        });
    }); 
});

router.patch('/order/:order_id/update', (req, res) => {
    var order_id = req.params.order_id;

     // If the order_id is not valid
     if(!ObjectID.isValid(order_id)){
        // Send user 400 - bad request message
        // and quit app
        return res.status(400).send();
    }

    // Filter only the editable fields
    var body = _.pickDeep(req.body, 
        [
            'pizzas','name', 'size', 'amount', 'spread',
            'otherToppings', 'crustSize', 'meats', 'sauceOptions',
            'flavoredCrusts', 'cookOptions'
    ]);

    // To hold our order
    var insertOrder = {};
    insertOrder.ipAddress = req.connection.remoteAddress;
    insertOrder.orderTime = Date.now();
    insertOrder.totalPrice = 0;
    insertOrder.totalQuantity = 0;
    insertOrder.pizzas = [];


    // List to hold ordered pizzas
    var orderPizzas = [];
    // Store a copy of ordered pizzas into this list
    orderPizzas = body.pizzas;

    // Process each pizza and return a promise for each 
    // pizza
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
                        // Is the error propery set
                        if(crustSize.error){
                            return res.status(404).send({crustSize});
                        }
                        toSavePizza.crustSize = crustSize;
                        toSavePizza.price += crustSize.price;
                        toSavePizza.calCount += crustSize.calCount;
                        toSavePizza.slices = crustSize.slices;
                    } 
    
                    if(meats.length > 0){
                        // Check if there is any error in the meats list
                        const meatErr = meats.find((item) => {
                            return item.error !== undefined;
                        });

                        if(meatErr){
                            // Send error back to the user
                            return res.status(404).send({meatsErr});
                        }
                        toSavePizza.meats = meats; 
                        toSavePizza.price += totalPrice(meats);
                        toSavePizza.calCount += totalCal(meats);
                    }
    
                    if(otherToppings.length > 0){
                        // Check if there is any error in the toppings
                        const otherToppingErr = otherToppings.find((item) => {
                            return item.error !== undefined;
                        });

                        if(otherToppingErr){
                            // Display the err
                            return res.status(404).send({otherToppingErr});
                        }
                        toSavePizza.otherToppings = otherToppings;
                        toSavePizza.price += totalPrice(otherToppings);
                        toSavePizza.calCount += totalCal(otherToppings);
                    }
    
                    if(sauceOptions.length > 0){
                        // Check if there is any error in the meats list
                        const sauceOptionErr = sauceOptions.find((item) => {
                            return item.error !== undefined;
                        });

                        if(sauceOptionErr){
                            // Display the err
                            return res.status(404).send({sauceOptionErr});
                        }
                        toSavePizza.sauceOptions = sauceOptions;
                        toSavePizza.price += totalPrice(sauceOptions);
                        toSavePizza.calCount += totalCal(sauceOptions);
                    }
    
                    if(drinks.length > 0){
                         // Check if there is any error in the meats list
                         const drinkErr = drinks.some((item) => {
                            return item.error !== undefined;
                        });

                        if(drinkErr){
                            // Display the err
                            return res.status(404).send({drinksErr});
                        }
                        toSavePizza.drinks = drinks;
                        toSavePizza.price += totalPrice(drinks);
                    }
    
                    if(flavoredCrusts.length > 0){
                         // Check if there is any error in the meats list
                         const flavoredCrustErr = flavoredCrusts.some((item) => {
                            return item.error !== undefined;
                        });

                        if(flavoredCrustErr){
                            return res.status(404).send({flavoredCrustErr});
                        }
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
        // Run update query in the DB
        Order.findByIdAndUpdate(order_id, {$set: insertOrder}, {new: true, useFindAndModify: false})
        .then((updatedOrder) => {
           
            // Send the updated order to user and quit
            return res.send({updatedOrder});
        }).catch((e) => {
            // Send 400 - resource not found to user and quit
            return res.status(400).send();
        });
    }); 
});

module.exports = router;