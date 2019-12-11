const mongoose = require('mongoose');

const {db} = require('../db/database');

// Setup my database
var Schema = mongoose.Schema;

// Create Source Schema
var meatSchema = new Schema(
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


// Code to populate a few flavored crusts
var meats = [
{
    name: 'Pepperoni',
    spreads: [
        {
            name: 'Lite', 
            amounts: [
                {name: 'Half', cal: 3, price: 0.88},
                {name: 'Full', cal: 5, price: 1.75}
            ]
        },

        {
            name: 'Normal', 
            amounts: [
                {name: 'Half', cal: 5, price: 0.88},
                {name: 'Full', cal: 10, price: 1.75}
            ]
        },

        {
            name: 'Extra', 
            amounts: [
                {name: 'Half', cal: 10, price: 1.75},
                {name: 'Full', cal: 20, price: 3.50}
            ]
        },
    ]
},

{
    name: 'Steak',
    spreads: [
        {
            name: 'Lite', 
            amounts: [
                {name: 'Half', cal: 6, price: 1.75},
                {name: 'Full', cal: 13, price: 3.50}
            ]
        },

        {
            name: 'Normal', 
            amounts: [
                {name: 'Half', cal: 13, price: 1.75},
                {name: 'Full', cal: 25, price: 3.50}
            ]
        },
        {
            name: 'Extra', 
            amounts: [
                {name: 'Half', cal: 25, price: 3.50},
                {name: 'Full', cal: 50, price: 7.00}
            ]
        }
    ]
}
];

// Create the Crust Model
var Meat = mongoose.model('Meat', meatSchema);


/* Meat.insertMany(meats, (err) => {
    if(err){
        console.log(err);
    }
}); */


/*
FUNCTION NAME: updateMeat
INPUTS: orderedPizza(object)
OUTPUTS: toSaveMeats(array)
AUTHOR: Michael Kyagulanyi
*/
var updateMeat = (orderPizza) => {
    return new Promise((resolve, reject) => {
        var toSaveMeats = [];

        // Do we have ordered meats for this pizza
        if(orderPizza.meats){
            // Iterate through meats
            orderPizza.meats.forEach((orderMeat) => {
                var toSaveMeat = {};
                // Try finding meat from the DB
                Meat.findOne({name: orderMeat.name})
                .then((dbMeat) => {
                    // Find source from OrderSauces
                    // Update toSaveMeat
                    toSaveMeat.name = dbMeat.name;
                    var dbSpread = dbMeat.spreads.find((spread) => {
                        return spread.name === orderMeat.amount;
                    }); 

                    toSaveMeat.amount = dbSpread.name;
                    var amountsDetail = dbSpread.amounts.find((amount) => {
                        return amount.name === orderMeat.spread;
                    });
                    toSaveMeat.spread = amountsDetail.name;
                    toSaveMeat.calCount = amountsDetail.cal;
                    toSaveMeat.price = amountsDetail.price; 

                    // Add each meat to the save list
                    toSaveMeats.push(toSaveMeat);

                    // Have we iterrated through all the meats
                    if(toSaveMeats.length === 
                        orderPizza.meats.length){
                            resolve(toSaveMeats);
                    }
                },
                (err) => {
                    resolve('Could not find meat');
                });
            });
        } else {
            /*  Making sure that we always resolve with an empty array
                So, we can work with promise all. Because if any of the 
                promises doesn't resolve, the whole chain fails
            */
            resolve(toSaveMeats);
        }
    });
}

module.exports = {
    updateMeat
};