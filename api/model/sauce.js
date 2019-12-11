const mongoose = require('mongoose');

const {db} = require('../db/database');
const {getSum} = require('../helpers');

// Setup my database
var Schema = mongoose.Schema;

// Create Source Schema
var sauceSchema = new Schema(
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


// Populate a few sources into DB
var sauces = [
    {
        name: 'Mozzarella',
        spreads: [
            {
                name: 'Lite', 
                amounts: [
                    {name: 'Half', cal: 11, price: 0},
                    {name: 'Full', cal: 23, price: 0}
                ]
            },

            {
                name: 'Normal', 
                amounts: [
                    {name: 'Half', cal: 23, price: 0},
                    {name: 'Full', cal: 45, price: 0}
                ]
            },

            {
                name: 'Extra', 
                amounts: [
                    {name: 'Half', cal: 45, price: 0},
                    {name: 'Full', cal: 90, price: 1.75}
                ]
            },

            
            {
                name: 'x3', 
                amounts: [
                    {name: 'Half', cal: 68, price: 0.88},
                    {name: 'Full', cal: 135, price: 3.50}
                ]
            },
        ]
    },

    {
        name: 'Pizza Source',
        spreads: [
            {
                name: 'Lite', 
                amounts: [
                    {name: 'Full', cal: 5, price: 0}
                ]
            },

            {
                name: 'Normal', 
                amounts: [
                    {name: 'Full', cal: 10, price: 0}
                ]
            },

            {
                name: 'Extra', 
                amounts: [
                    {name: 'Full', cal: 20, price: 0}
                ]
            },
        ]
    }
];

// Create the Crust Model
var Sauce = mongoose.model('Sauce', sauceSchema);


/* Sauce.insertMany(sauces, (err) => {
    if(err){
        console.log(err);
    }
}); */


/*
FUNCTION NAME: updateSauce
INPUTS: orderedPizza(object)
OUTPUTS: toSaveSaucesOptions(array)
AUTHOR: Michael Kyagulanyi
*/
var updateSauce = (orderPizza) => {
    return new Promise((resolve, reject) => {
        var toSaveSaucesOptions = [];
        if(orderPizza.sauceOptions){
            
            var counter = 0;
            orderPizza.sauceOptions.forEach((orderSauce) => {
                var toSaveSauce = {};
                Sauce.findOne({name: orderSauce.name})
                .then((dbSauce) => {
                    // Find source from OrderSauces

                    // Update toSaveSauce
                    toSaveSauce.name = dbSauce.name;
                    var dbSpread = dbSauce.spreads.find((spread) => {
                        return spread.name === orderSauce.amount;
                    }); 

                    toSaveSauce.amount = dbSpread.name;
                    var amountsDetail = dbSpread.amounts.find((amount) => {
                        return amount.name === orderSauce.spread || orderSauce.spread === 'None';
                    });
                    toSaveSauce.spread = amountsDetail.name;
                    toSaveSauce.calCount = amountsDetail.cal;
                    toSaveSauce.price = amountsDetail.price; 

                    // Add each sauce to the save list
                    toSaveSaucesOptions.push(toSaveSauce);
                    if(toSaveSaucesOptions.length === 
                        orderPizza.sauceOptions.length){
                            resolve(toSaveSaucesOptions);
                    }
                },
                (err) => {
                    console.log('DB error', err);
                });
            });
        } else {
            /*  Making sure that we always resolve with an empty array
                So, we can work with promise all. Because if any of the 
                promises doesn't resolve, the whole chain fails
            */
            resolve(toSaveSaucesOptions);
        }
    });
}
module.exports = {
    updateSauce
};