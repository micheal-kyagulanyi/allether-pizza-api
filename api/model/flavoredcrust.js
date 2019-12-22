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
            // Validate flavored crust
            if(dbFlavoredCrust === null){
                throw new Error( `${flavoredCrust.name} is not a valid flavored crust name`);
            }
            // Find flavored from order flavored crusts
            // Update toSaveFlavoredCrust
            toSaveFlavoredCrust.name = dbFlavoredCrust.name;
            var dbSpread = {};
            dbSpread = dbFlavoredCrust.spreads.find((spread) => {
                return spread.name === flavoredCrust.amount;
            }); 
            // Validate spread
            if(dbSpread === undefined){
                throw new Error( `${flavoredCrust.amount} is not a valid flavored crust amount`);
            }
            toSaveFlavoredCrust.amount = dbSpread.name;

            var amountsDetail = {};
            amountsDetail = dbSpread.amounts.find((amount) => {
                return amount.name === flavoredCrust.spread;
            });
           
            // Validate  amounts detail
            if(amountsDetail === undefined){
                throw new Error( `${flavoredCrust.spread} is not a valid flavored crust spread`);
            }

            toSaveFlavoredCrust.spread = amountsDetail.name;
            toSaveFlavoredCrust.calCount = amountsDetail.cal;
            toSaveFlavoredCrust.price = amountsDetail.price; 
          
            resolve(toSaveFlavoredCrust);
        })
        .catch((e) => {
            toSaveFlavoredCrust.error = e.message;
            // Send back flavored crust with error message
            resolve(toSaveFlavoredCrust);
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