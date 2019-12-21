const mongoose = require('mongoose');
const {Promise} = require('bluebird');

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

// Create the Crust Model
var FlavoredCrust = mongoose.model('FlavoredCrust', flavoredCrustSchema);

var updateFlavoredCrust = (flavoredCrust) => {
    return new Promise((resolve, reject) => {
      
        var toSaveFlavoredCrust = {};
        // Try finding flavored crust from the DB
        FlavoredCrust.findOne({name: flavoredCrust.name})
        .then((dbFlavoredCrust) => {
            // Find flavored from order flavored crusts
            // Update toSaveFlavoredCrust
            toSaveFlavoredCrust.name = dbFlavoredCrust.name;
            var dbSpread = dbMeat.spreads.find((spread) => {
                return spread.name === flavoredCrust.amount;
            }); 

            toSaveFlavoredCrust.amount = dbSpread.name;
            var amountsDetail = dbSpread.amounts.find((amount) => {
                return amount.name === flavoredCrust.spread;
            });
            toSaveFlavoredCrust.spread = amountsDetail.name;
            toSaveFlavoredCrust = amountsDetail.cal;
            toSaveFlavoredCrust.price = amountsDetail.price; 

            resolve(toSaveFlavoredCrust);
        },
        (err) => {
            resolve('Could not find flavored crust');
        });
    });
}


// Gets us all the meats detail
var updatedFlavoredCrusts = (flavoredCrustsList) => {
    return new Promise(
        (resolve, reject) => {
            // If we don't have meats
            if(flavoredCrustsList === undefined){
                // We resolve with an empty list
                resolve([]);
            } else{
                Promise.map(flavoredCrustsList, updateFlavoredCrust)
                .then((flavoredCrusts) => {
                    resolve(flavoredCrusts);
                }
                , (err) => {
                    reject(err);
                });
            }
        }
    );      
};

module.exports = {
    updatedFlavoredCrusts
};