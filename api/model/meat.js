const mongoose = require('mongoose');
const {Promise} = require('bluebird');

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

// Create the Crust Model
var Meat = mongoose.model('Meat', meatSchema);
     
// This function takes in a meat object 
// and returns an updated meat object with DB info
var updateMeat = (orderMeat) => {
    return new Promise((resolve, reject) => {
        // Create updated meat
        toSaveMeat = {};
        // Try finding meat from the DB
        Meat.findOne({name: orderMeat.name})
        .then((dbMeat) => {
            // Validate meat
            if(dbMeat === null){
                throw new Error( `${orderMeat.name} is not a valid meat name`);
            }
            // Update the meat with DB data
            toSaveMeat.name = dbMeat.name;
            // Get spread details from the DB
            var dbSpread = {}
            dbSpread = dbMeat.spreads.find(
                (spread) =>{
                    return spread.name === orderMeat.amount;
                } 
            );
            // Validate spread
            if(dbSpread === undefined){
                throw new Error( `${orderMeat.amount} is not a valid meat amount`);
            }
            toSaveMeat.amount = dbSpread.name;
            // Get spread details from the DB
            var amountsDetail = {}
            amountsDetail = dbSpread.amounts.find((amount) => {
                return amount.name === orderMeat.spread;
            });

            if(amountsDetail === undefined){
                throw new Error( `${orderMeat.spread} is not a valid meat spread`);
            }
            toSaveMeat.spread = amountsDetail.name;
            toSaveMeat.calCount = amountsDetail.cal;
            toSaveMeat.price = amountsDetail.price; 
            resolve(toSaveMeat);
        })
        .catch((e) => {
            toSaveMeat.error = e.message;
            // Send back meat with error message
            resolve(toSaveMeat);
        });
    });
};

// Gets us all the meats detail
var updatedMeats = (meatsList) => {
    return new Promise(
        (resolve, reject) => {
            // If we don't have meats
            if(meatsList === undefined){
                // We resolve with an empty list
                resolve([]);
            } else{
                Promise.map(meatsList, updateMeat)
                .then((meats) => {
                    resolve(meats);
                }
                , (err) => {
                    reject(err);
                });
            }
        }
    );      
};

module.exports = {
    updatedMeats
};
