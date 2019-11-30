const express = require('express');
const router = express.Router();
var {ObjectID} = require('mongodb');


var {Order} = require('./../model/order');
var {CrustSize} = require('./../model/crustsize');
var {Meat} = require('./../model/meat');
var {FlavoredCrust} = require('./../model/flavoredcrust');
var {Sauce} = require('./../model/sauce');
var {Drink} = require('./../model/drink');
var {Topping} = require('./../model/topping');
var {totalPrice, totalCal} = require('./../helpers');

router.get('/', (req, res) => {
    // List the orders
    Order.find({}).then(
        (orders) => {
            res.send(orders);
        }
    );
});

router.post('/create', (req, res) => {
   
    var orderdPizzas = new Array();

    var orderdMeats = new Array();

    var order = new Object();

    orderdPizzas = req.body.pizzas;

     var allPizzas= new Array();
   
    var crusts;
    CrustSize.find({}).then((crustSizes) => {
        // DB crusts
        crusts = crustSizes;
        for(var i = 0; i < orderdPizzas.length; i++){
            var crustSize = new Object();
            var pizza = new Object();
            // Search ordered pizzas for crusts
           for(var j = 0; j < crusts.length; j++){
               if(orderdPizzas[i].crustSize.name === crusts[j].name &&
                crusts[j].size === orderdPizzas[i].crustSize.size){
                    
                    crustSize.name = crusts[j].name;
                    crustSize.price = crusts[j].price;
                    crustSize.slices = crusts[j].slices;
                    crustSize.calCount = crusts[j].calCount;
                    crustSize.size = crusts[j].size;
                    pizza.crustSize = crustSize;
                    allPizzas.push(pizza);
                    break;
               }
           }
        } // Added crust size to piza

        //  Process meats
        Meat.find({}).then((meats) => {
           
           /*  console.log('Meats');
            console.log('================================'); */
            for(var i = 0; i < orderdPizzas.length; i++){
                allPizzas[i].meats = new Array();
                // Search ordered pizzas for meats
                for(var j = 0; j < orderdPizzas[i].meats.length; j++){
                    for(var k = 0; k < meats.length; k++){
                        if(orderdPizzas[i].meats[j].name === meats[k].name){
                            // Search the different amounts
                            /* console.log('Meat:', meats[k].name); */
                            for(var l = 0; l < meats[k].spreads.length; l++){
                                if(meats[k].spreads[l].name === orderdPizzas[i].meats[j].amount){
                                    /* console.log('Spread:', orderdPizzas[i].meats[j].amount);
                                    // Get each spread details */
                                    for(var m = 0; m < meats[k].spreads[l].amounts.length; m++){
                                        if(orderdPizzas[i].meats[j].spread === meats[k].spreads[l].amounts[m].name){
                                            allPizzas[i].meats.push({
                                                spread: meats[k].spreads[l].amounts[m].name,
                                                amount: meats[k].spreads[l].name,
                                                name: meats[k].name,
                                                price: meats[k].spreads[l].amounts[m].price,
                                                calCount: meats[k].spreads[l].amounts[m].cal
                                            });
                                            break; 
                                        }  
                                    }
                                }
                                
                            }
                        }
                    }
                }
            }
            
        }); // End process meats
       

        // Todo process other toppings
        Topping.find({}).then((toppings) => {
            
           for(var i = 0; i < orderdPizzas.length; i++){
                allPizzas[i].otherToppings = new Array();
               // For each toppings list
               for(var j = 0; j < orderdPizzas[i].otherToppings.length; j++){
                   // Search for topping from the db
                    for(var k = 0; k < toppings.length; k++){
                        // Check for a match
                        if(orderdPizzas[i].otherToppings[j].name === toppings[k].name){
                            // Search the db topping for spreads
                            for(var l = 0; l < toppings[k].spreads.length; l++){
                                // Check for match with order spread
                                if(toppings[k].spreads[l].name === orderdPizzas[i].otherToppings[j].amount){
                                    for(var m = 0; m < toppings[k].spreads[l].amounts.length; m++){
                                        if(orderdPizzas[i].otherToppings[j].spread === toppings[k].spreads[l].amounts[m].name){
                                            allPizzas[i].otherToppings.push({
                                                spread: toppings[k].spreads[l].amounts[m].name,
                                                amount: toppings[k].spreads[l].name,
                                                name: toppings[k].name,
                                                price: toppings[k].spreads[l].amounts[m].price,
                                                calCount: toppings[k].spreads[l].amounts[m].cal
                                            });
                                            break; 
                                        }
                                    }
                                }
                            }
                        }
                    }
               }
           }

        });

        // Todo process flavored crust
        FlavoredCrust.find({}).then((flavoredCrusts) => {
            var orderflavoredCrusts = new Array();
           for(var i = 0; i < orderdPizzas.length; i++){
            allPizzas[i].flavoredCrusts = new Array();
               // For each flavoredCrusts list
               for(var j = 0; j < orderdPizzas[i].flavoredCrusts.length; j++){
                   // Search for topping from the db
                    for(var k = 0; k < flavoredCrusts.length; k++){
                        // Check for a match
                        if(orderdPizzas[i].flavoredCrusts[j].name === flavoredCrusts[k].name){
                            // Search the db topping for spreads
                            for(var l = 0; l < flavoredCrusts[k].spreads.length; l++){
                                // Check for match with order spread
                                if(flavoredCrusts[k].spreads[l].name === orderdPizzas[i].flavoredCrusts[j].amount){
                                    for(var m = 0; m < flavoredCrusts[k].spreads[l].amounts.length; m++){
                                        if(orderdPizzas[i].flavoredCrusts[j].spread === flavoredCrusts[k].spreads[l].amounts[m].name){
                                            ;
                                            allPizzas[i].flavoredCrusts.push({
                                                spread: flavoredCrusts[k].spreads[l].amounts[m].name,
                                                amount: flavoredCrusts[k].spreads[l].name,
                                                name: flavoredCrusts[k].name,
                                                price: flavoredCrusts[k].spreads[l].amounts[m].price,
                                                calCount: flavoredCrusts[k].spreads[l].amounts[m].cal
                                            });
                                            break; 
                                        }
                                    }
                                }
                            }
                        }
                    }
               }
           }
           
        }); // Adding flavored crusts

        //  Todo - Get drinks
        Drink.find({}).then((drinks) => {
            for(var i = 0; i < orderdPizzas.length; i++){
                allPizzas[i].drinks = new Array();
                for(var j = 0; j < orderdPizzas[i].drinks.length; j++){
                    // Search for drink from the db
                    for(var k = 0; k < drinks.length; k++){
                        if(drinks[k].name === orderdPizzas[i].drinks[j].name){
                            // Search orderd drink for price
                            for(var l = 0; l < drinks[k].sizes.length; l++){
                                if(drinks[k].sizes[l].name === orderdPizzas[i].drinks[j].size){
                                    allPizzas[i].drinks.push(
                                        {
                                            name: drinks[k].name,
                                            size: drinks[k].sizes[l].name,
                                            price: drinks[k].sizes[l].price
                                        }
                                    );
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        });

        // Todd - Get source options
        Sauce.find({}).then((sauceOptions) => {
            
            //console.log(sauceOptions.length);
           for(var i = 0; i < orderdPizzas.length; i++){
            allPizzas[i].sauceOptions = new Array();
               // For each sauceOptions list
               for(var j = 0; j < orderdPizzas[i].sauceOptions.length; j++){
                   // Search for topping from the db
                    for(var k = 0; k < sauceOptions.length; k++){
                        // Check for a match
                        if(orderdPizzas[i].sauceOptions[j].name === sauceOptions[k].name){
                            for(var l = 0; l < sauceOptions[k].spreads.length; l++){
                                // Check for match with order spread
                                if(sauceOptions[k].spreads[l].name === orderdPizzas[i].sauceOptions[j].amount){
                                    for(var m = 0; m < sauceOptions[k].spreads[l].amounts.length; m++){
                                        if(orderdPizzas[i].sauceOptions[j].spread === 'None' || orderdPizzas[i].sauceOptions[j].spread === sauceOptions[k].spreads[l].amounts[m].name){
                                            allPizzas[i].sauceOptions.push({
                                                spread: sauceOptions[k].spreads[l].amounts[m].name,
                                                amount: sauceOptions[k].spreads[l].name,
                                                name: sauceOptions[k].name,
                                                price: sauceOptions[k].spreads[l].amounts[m].price,
                                                calCount: sauceOptions[k].spreads[l].amounts[m].cal
                                            });
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
               }
           }
           
            var price = 0
           for(var i = 0; i < allPizzas.length; i++){
                var tPrice = 0;
                allPizzas[i].price =  allPizzas[i].crustSize.price;
                allPizzas[i].calCount =  allPizzas[i].crustSize.calCount;

                for(var a = 0; a < allPizzas[i].meats.length; a++){
                    allPizzas[i].price += allPizzas[i].meats[a].price;
                    allPizzas[i].calCount += allPizzas[i].meats[a].calCount;
                }

                for(var a = 0; a < allPizzas[i].flavoredCrusts.length; a++){
                    allPizzas[i].price += allPizzas[i].flavoredCrusts[a].price;
                    allPizzas[i].calCount += allPizzas[i].meats[a].calCount;
                }

                for(var a = 0; a < allPizzas[i].otherToppings.length; a++){
                    allPizzas[i].price += allPizzas[i].otherToppings[a].price;
                    allPizzas[i].calCount += allPizzas[i].otherToppings[a].calCount;
                }

                for(var a = 0; a < allPizzas[i].drinks.length; a++){
                    allPizzas[i].price += allPizzas[i].drinks[a].price;
                }
            }

            var price = 0
            for(var i = 0; i < allPizzas.length; i++){
                price += allPizzas[i].price;
            }

            order._id = new ObjectID();
            order.name = req.body.name;
            order.ipAddress = req.connection.remoteAddress;
            order.address =  req.body.address;
            order.orderTime = Date.now();
            order.deliverStatus = req.body.deliveryStatus;
            order.totalPrice = price;
            order.totalQuantity = allPizzas.length;
            order.pizzas = allPizzas;

            // Todo save data to db
            var myOrder = new Order(order);
            myOrder.save().then((doc) => {
                res.send(JSON.stringify(doc));
            }).catch((e) => {
                console.log(e);
            });
        });
    });
    
});

module.exports = router;