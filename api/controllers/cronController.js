// Get all require npm modules
const {ObjectID} = require('mongodb');
const {Promise} = require('bluebird');
const schedule = require('node-schedule');
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
var {Cron} = require('./../model/cron');

// Get all the helper functions
var {updateItem} = require('./../helpers');






// POST: Create an Order cron job
exports.createCronJob = (req, res) => {
    // 1. Create the order
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
                    /* 
                      *  Update this pizza's info
                      *  Update toSavePizza with updated info
                    */
                    var toSavePizza = {};
                    toSavePizza.price = 0;
                    toSavePizza.calCount = 0;
    
                    toSavePizza.cookOptions = pizza.cookOptions;
    
                    updateItem({crustSize}, res, toSavePizza);
    
                    updateItem({meats}, res, toSavePizza);
    
                    updateItem({otherToppings}, res, toSavePizza);
    
                    updateItem({sauceOptions}, res, toSavePizza);
                    
                    updateItem({drinks}, res, toSavePizza);
    
                    updateItem({flavoredCrusts}, res, toSavePizza);
    
                    // Push each updated pizza's promise to the array
                    resolve(toSavePizza);
                }); 
            }
        );
    })
    .then( async (updatedPizzas) => {
        // Update the order with all the pizza info
        updatedPizzas.forEach(pizza => {
            insertOrder.totalPrice += pizza.price;
            insertOrder.pizzas.push(pizza);
            insertOrder.totalQuantity += 1;
        });

        Cron.create({}, (err, createdCron) => {
            console.log('Creating cron')

            if(err){
                // Something wrong with the server
                return res.status(500).send(err.message);
            }

            // Attach all created orders to this cron
            jobName = `${createdCron._id}`;
            res.send(`Job ${jobName} successfully created`);
            schedule.scheduleJob(jobName,'* * * * * *', () => {
                Order.create(insertOrder, (err, createdOrder) => {
                    if(err){
                        return res.status(500).send(err.message);
                    }
                    // Add order to this cron 
                    createdCron.orders.push(createdOrder);
                    // Commit the above change to this cron
                    createdCron.save();
                });
            });
        });        
    }); 
};

exports.stopCronJob = (req, res) => {
    jobID = req.params.cron_id;
    // Is the order_id valid
    if(!ObjectID.isValid(jobID)){
        return res.status(400).send();
    }

    var currentJob = schedule.scheduledJobs[jobID];
    if(currentJob !== undefined){
        currentJob.cancel();
        res.send(`Job ${jobID} successfully canceled`);
    }
    else {
        res.status(404).send(`Job ${jobID} could not be found`);
    }
};

exports.getAllCronJobs = (req, res) => {
    Cron.find().populate('orders')
    .exec((err, results) => {
        // Display each order
        res.send(results);
    })
}



    


