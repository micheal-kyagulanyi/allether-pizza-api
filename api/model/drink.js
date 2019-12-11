const mongoose = require('mongoose');

const {db} = require('../db/database');

// Setup my database
var Schema = mongoose.Schema;

// Create Source Schema
var drinkSchema = new Schema(
    {
        name: {
            type: String
        },
        sizes: [
            {
               name: String,
               price: Number
            }
        ]
    }
);

// Script to add flavored crusts
 var drinks = [
    {
        name: 'Cocacola',
        sizes: [
            {
                name: 'Small', 
                price: 0.50
            },

            {
                name: 'Medium', 
                price: 1.50
            },

            {
                name: 'Large', 
                price: 2.60
            },
        ]
    },
    {
        name: 'Pepsi',
        sizes: [
            {
                name: 'Small', 
                price: 0.70
            },

            {
                name: 'Medium', 
                price: 1.90
            },

            {
                name: 'Large', 
                price: 2.80
            },
        ]
    },

    {
        name: 'Dr. Pepper',
        sizes: [
            {
                name: 'Small', 
                price: 1.00
            },

            {
                name: 'Medium', 
                price: 2.00
            },

            {
                name: 'Large', 
                price: 3.50
            },
        ]
    },


];

// Create the Crust Model
var Drink = mongoose.model('Drink', drinkSchema);

/* Drink.insertMany(drinks, (err) => {
    if(err){
        console.log(err);
    }
}); */

/*
FUNCTION NAME: updateDrink
INPUTS: orderedPizza(object)
OUTPUTS: toSaveDrinks(array)
AUTHOR: Michael Kyagulanyi
*/
var updateDrink = (orderPizza) => {
    return new Promise((resolve, reject) => {

        // List to hold all the drinks for a pizza
        var toSaveDrinks = [];

        // Do we have ordered toppings for this pizza
        if(orderPizza.drinks){
            // Iterate through drinks
            orderPizza.drinks.forEach((orderDrink) => {
                var toSaveDrink = {};
                // Try finding flavored crust from the DB
                Drink.findOne({name: orderDrink.name})
                .then((dbDrink) => {
                    // Find topping from order toppings
                    // Update toSaveOtherTopping
                    toSaveDrink.name = dbDrink.name;
                    var amountsDetail = dbDrink.sizes.find((size) => {
                        return size.name === orderDrink.size;
                    });
                    
                    toSaveDrink.size = amountsDetail.size;
                    toSaveDrink.price = amountsDetail.price;
        
                    toSaveDrinks.push(toSaveDrink);
                    // Have we iterrated through all toppings
                    if(toSaveDrinks.length === 
                        orderPizza.drinks.length){
                            resolve(toSaveDrinks);
                    }
                },
                (err) => {
                    resolve('Could not find drink');
                });
            });
        } else {
            /*  Making sure that we always resolve with an empty array
                So, we can work with promise all. Because if any of the 
                promises doesn't resolve, the whole chain fails
            */
            resolve(toSaveDrinks);
        }
    });
}


module.exports = {
    updateDrink
};