const mongoose = require('mongoose');

const {db} = require('../db/database');

// Setup my database
var Schema = mongoose.Schema;

// Create Source Schema
var flavoredCrustSchema = new Schema(
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

// Script to add flavored crusts
var flavoredCrusts = [
    {
        name: 'Original Crust',
        spreads: [
            {
                name: 'Lite', 
                amounts: [
                    {name: 'Half', cal: 0, price: 0.00},
                    {name: 'Full', cal: 0, price: 0.00}
                ]
            },

            {
                name: 'Normal', 
                amounts: [
                    {name: 'Half', cal: 0, price: 0.00},
                    {name: 'Full', cal: 0, price: 0.00}
                ]
            },

            {
                name: 'Extra', 
                amounts: [
                    {name: 'Half', cal: 0, price: 0.00},
                    {name: 'Full', cal: 0, price: 0.00}
                ]
            },
        ]
    },

    {
        name: 'Butter Crust',
        spreads: [
            {
                name: 'Lite', 
                amounts: [
                    {name: 'Half', cal: 8, price: 0.00},
                    {name: 'Full', cal: 15, price: 0.00}
                ]
            },

            {
                name: 'Normal', 
                amounts: [
                    {name: 'Half', cal: 15, price: 0.00},
                    {name: 'Full', cal: 30, price: 0.00}
                ]
            },
            {
                name: 'Extra', 
                amounts: [
                    {name: 'Half', cal: 30, price: 0.00},
                    {name: 'Full', cal: 60, price: 0.00}
                ]
            }
        ]
    }
];

// Create the Crust Model
var FlavoredCrust = mongoose.model('FlavoredCrust', flavoredCrustSchema);

/* FlavoredCrust.insertMany(flavoredCrusts, (err) => {
    if(err){
        console.log(err);
    }
}); */


/*
FUNCTION NAME: updateFlavoredCrust
INPUTS: orderedPizza(object)
OUTPUTS: toSaveFlavoredCrusts(array)
AUTHOR: Michael Kyagulanyi
*/
var updateFlavoredCrust = (orderPizza) => {
    return new Promise((resolve, reject) => {
        var toSaveFlavoredCrusts = [];

        // Do we have ordered meats for this pizza
        if(orderPizza.flavoredCrusts){
            // Iterate through meats
            orderPizza.flavoredCrusts.forEach((orderFlavoredCrust) => {
                var toSaveFlavoredCrust = {};
                // Try finding flavored crust from the DB
                FlavoredCrust.findOne({name: orderFlavoredCrust.name})
                .then((dbFlavoredCrust) => {
                    // Find flavored from order flavored crusts
                    // Update toSaveFlavoredCrust
                    toSaveFlavoredCrust.name = dbFlavoredCrust.name;
                    var dbSpread = dbMeat.spreads.find((spread) => {
                        return spread.name === orderFlavoredCrust.amount;
                    }); 

                    toSaveFlavoredCrust.amount = dbSpread.name;
                    var amountsDetail = dbSpread.amounts.find((amount) => {
                        return amount.name === orderFlavoredCrust.spread;
                    });
                    toSaveFlavoredCrust.spread = amountsDetail.name;
                    toSaveFlavoredCrust = amountsDetail.cal;
                    toSaveFlavoredCrust.price = amountsDetail.price; 

                    // Add each flavored crust to the save list
                    toSaveFlavoredCrusts.push(toSaveFlavoredCrust);

                    // Have we iterrated through all flavored crusts
                    if(toSaveFlavoredCrusts.length === 
                        orderPizza.flavoredCrusts.length){
                            resolve(toSaveFlavoredCrusts);
                    }
                },
                (err) => {
                    resolve('Could not find crust');
                });
            });
        } else {
            /*  Making sure that we always resolve with an empty array
                So, we can work with promise all. Because if any of the 
                promises doesn't resolve, the whole chain fails
            */
            resolve(toSaveFlavoredCrusts);
        }
    });
}

module.exports = {
    updateFlavoredCrust
};