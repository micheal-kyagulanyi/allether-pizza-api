const express = require('express');
const router = express.Router();
const {Promise} = require('bluebird');

var {Order} = require('./../model/order');
var {updateCrustSize} = require('./../model/crustsize');
var {updatedMeats} = require('./../model/meat');
var {updatedFlavoredCrusts} = require('./../model/flavoredcrust');
var {updatedSauces} = require('./../model/sauce');
var {updatedDrinks} = require('./../model/drink');
var {updatedToppings} = require('./../model/topping');
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
                    (crust, meats,toppings, sauces, drinks, crusts) => {
                    // Update this pizza's info
    
                    // Update toSavePizza with updated info
                    var toSavePizza = {};
                    toSavePizza.price = 0;
                    toSavePizza.calCount = 0;

                    toSavePizza.cookOptions = pizza.cookOptions;
    
                    if(crust !== undefined){
                        toSavePizza.updateCrustSize = crust;
                        toSavePizza.price += crust.price;
                        toSavePizza.calCount += crust.calCount;
                    } 
    
                    if(meats.length > 0){
                        toSavePizza.meats = meats; 
                        toSavePizza.price += totalPrice(meats);
                        toSavePizza.calCount += totalCal(meats);
                    }
    
                    if(toppings.length > 0){
                        toSavePizza.otherToppings = toppings;
                        toSavePizza.price += totalPrice(toppings);
                        toSavePizza.calCount += totalCal(toppings);
                    }
    
                    if(sauces.length > 0){
                        toSavePizza.sauceOptions = sauces;
                        toSavePizza.price += totalPrice(sauces);
                        toSavePizza.calCount += totalCal(sauces);
                    }
    
                    if(drinks.length > 0){
                        toSavePizza.drinks = drinks;
                        toSavePizza.price += totalPrice(drinks);
                    }
    
                    if(crusts.length > 0){
                        toSavePizza.sauceOptions = crusts;
                        toSavePizza.price += totalPrice(crusts);
                        toSavePizza.calCount += totalCal(crusts);
                    }
                    resolve(toSavePizza);
                }
                ); 
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