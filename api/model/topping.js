const mongoose = require('mongoose');

const {db} = require('../db/database');

// Setup my database
var Schema = mongoose.Schema;

// Create Source Schema
var toppingSchema = new Schema(
    {
        name: {
            type: String
        },
        spreads: [
            {
               name: String,
               amounts: [
                   {
                       name: String,
                       cal: Number,
                       price: Number
                   }
               ]
            }
        ]
    }
);


var toppings = [
    {
        name: 'Feta',
        spreads: [
            {
                name: 'Lite', 
                amounts: [
                    {name: 'Half', cal: 9, price: 0.88},
                    {name: 'Full', cal: 18, price: 1.75}
                ]
            },

            {
                name: 'Normal', 
                amounts: [
                    {name: 'Half', cal: 18, price: 0.88},
                    {name: 'Full', cal: 35, price: 1.75}
                ]
            },

            {
                name: 'Extra', 
                amounts: [
                    {name: 'Half', cal: 35, price: 1.75},
                    {name: 'Full', cal: 70, price: 3.50}
                ]
            },
        ]
    },

    {
        name: 'Black Olive',
        spreads: [
            {
                name: 'Lite', 
                amounts: [
                    {name: 'Half', cal: 4, price: 0.88},
                    {name: 'Full', cal: 8, price: 1.75}
                ]
            },

            {
                name: 'Normal', 
                amounts: [
                    {name: 'Half', cal: 8, price: 0.88},
                    {name: 'Full', cal: 15, price: 1.75}
                ]
            },
            {
                name: 'Extra', 
                amounts: [
                    {name: 'Half', cal: 15, price: 1.75},
                    {name: 'Full', cal: 30, price: 3.50}
                ]
            }
        ]
    }
];

// Create the Crust Model
var Topping = mongoose.model('Topping', toppingSchema);

/* Topping.insertMany(toppings, (err) => {
    if(err){
        console.log(err);
    }
}); */


/*
FUNCTION NAME: updateOtherTopping
INPUTS: orderedPizza(object)
OUTPUTS: toSaveOtherToppings(array)
AUTHOR: Michael Kyagulanyi
*/
var updateOtherTopping = (orderPizza) => {
    return new Promise((resolve, reject) => {

        // List to hold all the toppings for a pizza
        var toSaveOtherToppings = [];

        // Do we have ordered toppings for this pizza
        if(orderPizza.otherToppings){
            // Iterate through meats
            orderPizza.otherToppings.forEach((orderOtherTopping) => {
                var toSaveOtherTopping = {};
                // Try finding flavored crust from the DB
                Topping.findOne({name: orderOtherTopping.name})
                .then((dbOtherTopping) => {
                    // Find topping from order toppings
                    // Update toSaveOtherTopping
                    toSaveOtherTopping.name = dbOtherTopping.name;
                    var dbSpread = dbOtherTopping.spreads.find((spread) => {
                        return spread.name === orderOtherTopping.amount;
                    }); 

                    //console.log('Spread name:::',dbSpread.name);
                    toSaveOtherTopping.amount = dbSpread.name;

                    var amountsDetail = dbSpread.amounts.find((amount) => {
                        return amount.name === orderOtherTopping.spread;
                    });
                    
                    toSaveOtherTopping.spread = amountsDetail.name;
                    toSaveOtherTopping.calCount = amountsDetail.cal;
                    toSaveOtherTopping.price = amountsDetail.price; 
                    // Add each topping to the save list
                    toSaveOtherToppings.push(toSaveOtherTopping);
                    // Have we iterrated through all toppings
                    if(toSaveOtherToppings.length === 
                        orderPizza.otherToppings.length){
                            resolve(toSaveOtherToppings);
                    }
                },
                (err) => {
                    resolve('Could not find topping');
                });
            });
        } else {
            /*  Making sure that we always resolve with an empty array
                So, we can work with promise all. Because if any of the 
                promises doesn't resolve, the whole chain fails
            */
            resolve(toSaveOtherToppings);
        }
    });
}

module.exports = {
    updateOtherTopping
};