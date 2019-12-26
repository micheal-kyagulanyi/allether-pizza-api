// Get all require npm modules
const {ObjectID} = require('mongodb');
const {Promise} = require('bluebird');
const {startOfDay, subHours} = require('date-fns');
const _ = require('lodash');
require('deepdash')(_); 

// Get all the required models moduels to process an order
var {Order} = require('./../model/order');
var {updateCrustSize} = require('./../model/crustsize');
var {updatedMeats} = require('./../model/meat');
var {updatedFlavoredCrusts} = require('./../model/flavoredcrust');
var {updatedSauces} = require('./../model/sauce');
var {updatedDrinks} = require('./../model/drink');
var {updatedToppings} = require('./../model/topping');

// Get all the helper functions
var {totalCal, totalPrice} = require('./../helpers');

// GET: List all the orders and paginated
exports.getAllOrders = (req, res) => {
    res.json(res.paginatedResults);
};

// A promise that returns total number of orders
var totalOrders = () => {
    return new Promise((resolve, reject) => {
        Order.estimatedDocumentCount({}, (err, count) => {
            if(!err){
                resolve(count);
            } else{
                resolve(0);
            }
        });
    });
};


// A promise that returns total number of orders
var totalOrdersToday = () => {
    var today = startOfDay(new Date());
    return new Promise((resolve, reject) => {
        Order.countDocuments({"orderTime": {$lt: today}} , (err, count) => {
            if(!err){
                resolve(count);
            } else{
                resolve(0);
            }
        });
    });
};


// A promise that returns total number of orders
var totalOrdersLastHour = () => {
    var lastHour = subHours(new Date(),1);
    return new Promise((resolve, reject) => {
        Order.countDocuments({"orderTime": {$gt: lastHour}} , (err, count) => {
            if(!err){
                resolve(count);
            } else{
                resolve(0);
            }
        });
    });
};


// A promise that returns total number of pizzas
var totalPizzas = () => {
    return new Promise((resolve, reject) => {
        Order.aggregate([
            {
                $group: {
                    _id: "", // Creates one group fo all documents
                    total: {$sum: "$totalQuantity"}
                }
            }
        ], (err, result) => {
           if(!err){
               resolve(result[0].total);
           } else {
               resolve(0);
           }
        });
    });
};

// Get popular item
var popularItem = (fieldName) => {
    // This filter only gets this category's documents where lists are not empty.
    // It's wise doing it here than in the aggregation pipeline.
    var matchFilterKey = `pizzas.${fieldName}`;
    var matchFilter = {};
    matchFilter[matchFilterKey] = {$ne: []}; 
    return new Promise((resolve, reject) => {
        Order.aggregate([
            // This filters this item's empty lists
            {$match: matchFilter}, 
            // Stage1: unwind the top array
            {$unwind: "$pizzas"},
            // Stage2: Unwind the required item array
            {$unwind: `$${matchFilterKey}`},
            // Stage3: Group items by item name
            {$group: {_id: `$${matchFilterKey}.name`, total: {$sum: 1}}},
            // Sort the records on total in descending order
            {$sort: {"total": -1}}
        ], (err, results) => {
            if(!err){
                // Get the top record of the sorted list
                var myResult = {};
                myResult.name = results[0]._id;
                myResult.count = results[0].total;
                // Compute items total
                const itemsTotal = results.reduce(
                    (sum, item) => {
                        return sum + item.total;
                    }, 0
                );
                const percent = (myResult.count/itemsTotal) * 100;
                myResult.total = itemsTotal;
                myResult.percentange = percent;
                resolve(myResult);      
            }
        });
    });
};

// GET: Display orders stats
exports.getAllOrdersStats = (req, res) => {
    Promise.all([
        totalOrders(),
        totalPizzas(),
        totalOrdersToday(),
        totalOrdersLastHour()/* ,
        popularItem('otherToppings'),
        popularItem('meats'),
        popularItem('drinks') */
        ]).spread((allOrders, allPizzas, allOrdersToday, totalOrdersLastHour,
            popularTopping, popularMeat, popularDrink) => {
        var stats = {};
        var all = {}
        var today = {}
        all.totalOrders = allOrders;
        all.totalPizzas = allPizzas;
        all.popularTopping = popularTopping;
        all.popularMeat = popularMeat;
        all.popularDrink = popularDrink;
        stats.all = all;
        today.all = allOrdersToday;
        today.lastHour = totalOrdersLastHour;
        stats.today = today;
        res.send({stats});
    });
};

// GET: specific order by _id.
exports.getOrderById = (req, res) => {
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
};

// GET: specific order status by _id.
exports.getOrderStatusById = (req, res) => {
    var order_id = req.params.order_id;
    // Is the order_id valid
    if(!ObjectID.isValid(order_id)){
        return res.status(400).send();
    }

    Order.findById(order_id, '_id orderName deliveryStatus')
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
};


// POST: create Order 
exports.createOrder = (req, res) => {
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
                        // Check if there is any error in the sauces list
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
                            // Check if there is any error in the drinks list
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
                            // Check if there is any error in the flavored crust list
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
        // Create Order in the DB
        Order.create(insertOrder, (err, createdOrder) => {
            if(err){
                // Something wrong with the server
                return res.status(500).send(err.message);
            }
            res.json(createdOrder);
        });
    }); 
};

// PATCH: Find Order by _id and update  
exports.findOrderByIdAndUpdate = (req, res) => {
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
                        // Check if there is any error in the sauces list
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
                         // Check if there is any error in the drink list
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
                         // Check if there is any error in the flavored crust list
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
}