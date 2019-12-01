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
    // Create order
    var insertOrder = new Object();
    insertOrder._id = new ObjectID();
    insertOrder.name = req.body.name;
    insertOrder.ipAddress = req.connection.remoteAddress;
    insertOrder.orderTime = Date.now();
    insertOrder.deliveryStatus = req.body.deliveryStatus;
    insertOrder.totalPrice = 0;
    insertOrder.totalQuantity = 0;
    insertOrder.pizzas = new Array();

    // Process all the pizzas from the incoming order
    var orderPizzas = new Array();
    orderPizzas = req.body.pizzas;


   
      
            
    toSavePizzas = new Array();
    new Promise((resolve, reject) => {
        orderPizzas.forEach(orderPizza => {
            var toSavePizza = new Object();
            // 1. Update the crust and size info, with data from the db
            var crustSize = new Object();
            CrustSize.findOne({name: orderPizza.crustSize.name}).then(
                (crust) => {
                    // Find each crust info from the db
                    var crustInfo = crust.sizes.find((size) => {
                        return size.name === orderPizza.crustSize.size;
                    });
                    // Update crust info
                    crustSize.name = crust.name;
                    crustSize.size = crustInfo.name;
                    crustSize.price = crustInfo.price;
                    crustSize.slices = crustInfo.slices;
                    crustSize.calCount = crustInfo.calCount;
    
                    // Update to save pizza
                    toSavePizza.crustSize = crustSize;
                    toSavePizza.price = crustSize.price;
                    toSavePizza.calCount = crustSize.calCount;
    
                    /* // Process the sauce options
                    if(orderPizza.sauceOptions){
                        return Sauce.find({});
                    } */
                    return Sauce.find({});
                }
            )
            .then((dbSauces) => {
                var toSaveSaucesOptions = new Array();
                if(orderPizza.sauceOptions){
                    orderPizza.sauceOptions.forEach((orderSauce) => {
                        var toSaveSauce = new Object();
                        // Find source from OrderSauces
                        var dbSauce = dbSauces.find((sauce) => {
                            return sauce.name === orderSauce.name;
                        });
                        toSaveSauce.name = dbSauce.name;
                        var dbSpread = dbSauce.spreads.find((spread) => {
                            return spread.name === orderSauce.amount;
                        }); 
                        // Todo Update to save spread
                        toSaveSauce.amount = dbSpread.name;
                        var amountsDetail = dbSpread.amounts.find((amount) => {
                            return amount.name === orderSauce.spread || orderSauce.spread === 'None';
                        });
                        toSaveSauce.spread = amountsDetail.name;
                        toSaveSauce.calCount = amountsDetail.cal;
                        toSaveSauce.price = amountsDetail.price; 
                        toSaveSaucesOptions.push(toSaveSauce);
                    });
        
                    // Update pizza
                    toSavePizza.sauceOptions = toSaveSaucesOptions;
                    // Update pizza price and calcount
                    const sauceCost = toSaveSaucesOptions.reduce(
                        (currentPrice, sauce) => {
                            return sauce.price + currentPrice;
                        }, 
                        0
                    );
                    toSavePizza.price += sauceCost;
        
                    const sauceCal = toSaveSaucesOptions.reduce(
                        (currentCal, sauce) => {
                            return sauce.calCount + currentCal;
                        }, 
                        0
                    );
                    toSavePizza.calCount += sauceCal;
                }
                
                
                // Process meats
               /*  if(orderPizza.meats){
                    return Meat.find({});
                } */

                return Meat.find({});
                
            })
            .then((dbMeats) => {
                var toSaveMeats = new Array();
                if(orderPizza.meats) {
                    orderPizza.meats.forEach((orderMeat) => {
                        var toSaveMeat = new Object();
                        // Find source from OrderSauces
                        var dbMeat = dbMeats.find((meat) => {
                            return meat.name === orderMeat.name;
                        });
                        toSaveMeat.name = dbMeat.name;
                        var dbSpread = dbMeat.spreads.find((spread) => {
                            return spread.name === orderMeat.amount;
                        }); 
                        // Todo Update to save spread
                        toSaveMeat.amount = dbSpread.name;
                        var amountsDetail = dbSpread.amounts.find((amount) => {
                            return amount.name === orderMeat.spread;
                        });
                        toSaveMeat.spread = amountsDetail.name;
                        toSaveMeat.calCount = amountsDetail.cal;
                        toSaveMeat.price = amountsDetail.price; 
                        toSaveMeats.push(toSaveMeat);
                    });
        
                    // Update pizza
                    toSavePizza.meats = toSaveMeats;
                    // Update pizza price and calcount
                    const meatCost = toSaveMeats.reduce(
                        (currentPrice, meat) => {
                            return meat.price + currentPrice;
                        }, 
                        0
                    );
                    toSavePizza.price += meatCost;
        
                    const meatCal = toSaveMeats.reduce(
                        (currentCal, meat) => {
                            return meat.calCount + currentCal;
                        }, 
                        0
                    );
                    toSavePizza.calCount += meatCal;
                }
                // Process other toppings
                /* if(orderPizza.otherToppings){
                    return Topping.find({});
                } */
                return Topping.find({});
                
            })
            .then((dbToppings) => {
                var toSaveOtherToppings = new Array();
                if(orderPizza.otherToppings){
                    orderPizza.otherToppings.forEach((orderOtherTopping) => {
                        var toSaveOtherTopping = new Object();
                        // Find source from OrderSauces
                        var dbTopping = dbToppings.find((topping) => {
                            return topping.name === orderOtherTopping.name;
                        });
                        toSaveOtherTopping.name = dbTopping.name;
                        var dbSpread = dbTopping.spreads.find((spread) => {
                            return spread.name === orderOtherTopping.amount;
                        }); 
                        // Todo Update to save spread
                        toSaveOtherTopping.amount = dbSpread.name;
                        var amountsDetail = dbSpread.amounts.find((amount) => {
                            return amount.name === orderOtherTopping.spread;
                        });
        
                        toSaveOtherTopping.spread = amountsDetail.name;
                        toSaveOtherTopping.calCount = amountsDetail.cal;
                        toSaveOtherTopping.price = amountsDetail.price; 
                        toSaveOtherToppings.push(toSaveOtherTopping);
                    });
        
                    // Update pizza
                    toSavePizza.otherToppings = toSaveOtherToppings;
                    // Update pizza price and calcount
                    const toppingCost = toSaveOtherToppings.reduce(
                        (currentPrice, topping) => {
                            return topping.price + currentPrice;
                        }, 
                        0
                    );
                    toSavePizza.price += toppingCost;
        
                    const toppingCal = toSaveOtherToppings.reduce(
                        (currentCal, topping) => {
                            return topping.calCount + currentCal;
                        }, 
                        0
                    );
        
                    toSavePizza.calCount += toppingCal;
                }
                
                // Process other toppings
                /* if(orderPizza.flavoredCrusts) {
                    return FlavoredCrust.find({});
                } */
            })
            .then((dbFlavoredCrusts) => {
                var toSaveFlavoredCrusts = new Array();
    
                if(orderPizza.flavoredCrust){
                    // Do nothing go to the next step
                    orderPizza.flavoredCrusts.forEach((orderFlavoredCrust) => {
                        var toSaveFlavoredCrust = new Object();
                        // Find source from OrderSauces
                        var dbFlavoredCrust = dbFlavoredCrusts.find((flavoredCrust) => {
                            return flavoredCrust.name === orderFlavoredCrust.name;
                        });
                        toSaveFlavoredCrust.name = dbFlavoredCrust.name;
                        var dbSpread = dbFlavoredCrust.spreads.find((spread) => {
                            return spread.name === orderFlavoredCrust.amount;
                        }); 
                        // Todo Update to save spread
                        toSaveFlavoredCrust.amount = dbSpread.name;
                        var amountsDetail = dbSpread.amounts.find((amount) => {
                            return amount.name === orderFlavoredCrust.spread;
                        });
        
                        toSaveFlavoredCrust.spread = amountsDetail.name;
                        toSaveFlavoredCrust.calCount = amountsDetail.cal;
                        toSaveFlavoredCrust.price = amountsDetail.price; 
                        toSaveFlavoredCrusts.push(toSaveFlavoredCrust);
                    });
        
                    // Update pizza
                    toSavePizza.flavoredCrusts = toSaveFlavoredCrusts;
                    // Update pizza price and calcount
                    const flavoredCrustCost = toSaveFlavoredCrusts.reduce(
                        (currentPrice, flavoredCrust) => {
                            return flavoredCrust.price + currentPrice;
                        }, 
                        0
                    );
                    toSavePizza.price += flavoredCrustCost;
        
                    const flavoredCrustCal = toSaveFlavoredCrusts.reduce(
                        (currentCal, flavoredCrust) => {
                            return flavoredCrust.calCount + currentCal;
                        }, 
                        0
                    );
        
                    toSavePizza.calCount += flavoredCrustCal;
                }
    
                // Process Drinks
                /* if(orderPizza.drinks){
                    return Drink.find({});
                } */
                return Drink.find({});
            })
            .then((dbDrinks) => {
                var toSaveDrinks = new Array();
    
                if(orderPizza.drinks){
                    // Do nothing go to the next step
                    orderPizza.drinks.forEach((orderDrink) => {
                        var toSaveDrink = new Object();
                        // Find source from OrderSauces
                        var dbDrink = dbDrinks.find((drink) => {
                            return drink.name === orderDrink.name;
                        });
    
                        toSaveDrink.name = dbDrink.name;
    
                        var amountsDetail = dbDrink.sizes.find((amount) => {
                            return amount.name === orderDrink.size;
                        });
        
                        toSaveDrink.size = amountsDetail.name;
                        toSaveDrink.price = amountsDetail.price; 
                        toSaveDrinks.push(toSaveDrink);
                    });
        
                    // Update pizza
                    toSavePizza.drinks = toSaveDrinks;
                    // Update pizza price and calcount
                    const drinkCost = toSaveDrinks.reduce(
                        (currentPrice, drink) => {
                            return drink.price + currentPrice;
                        }, 
                        0
                    );
                    toSavePizza.price += drinkCost;
                }

                insertOrder.totalPrice += toSavePizza.price;
                insertOrder.totalQuantity += 1;
                insertOrder.pizzas.push(toSavePizza);

                toSavePizzas.push(toSavePizza);

                // Only resolve when done processing the whole order's pizzas
                if(insertOrder.totalQuantity == orderPizzas.length){
                    resolve(insertOrder);
                }
            })
            .catch(
                (err) => {
                    console.log(err);
                }
            );
        });
    })
    .then((completedOrder) => {
        var myOrder = new Order(completedOrder);
        myOrder.save().then((doc) => {
            res.json(completedOrder);
        }).catch((e) => {
            console.log(e);
        });
    });
});

module.exports = router;