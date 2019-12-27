const mongoose = require('mongoose');
const {Promise} = require('bluebird');

const {db} = require('../db/database');

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

// Create the Sauce Model
var Sauce = mongoose.model('Sauce', sauceSchema);

var updateSauce = (orderSauce) => {
    return new Promise((resolve, reject) => {  
        var toSaveSauce = {}; 
        Sauce.findOne({name: orderSauce.name})
        .then((dbSauce) => {
            // Validate if DB sauce exists
            if(dbSauce === null){
                throw new Error( `${orderSauce.name} is not a valid sauce name`);
            }
            toSaveSauce.name = dbSauce.name;

            var dbSpread = {};
            dbSpread = dbSauce.spreads.find((spread) => {
                return spread.name === orderSauce.amount;
            }); 

            // Validate spread
            if(dbSpread === undefined){
                throw new Error( `${orderSauce.amount} is not a valid sauce amount`);
            }

            toSaveSauce.amount = dbSpread.name;
            var amountsDetail = {};
            var amountsDetail = dbSpread.amounts.find((amount) => {
                return amount.name === orderSauce.spread || orderSauce.spread === 'None';
            });

            // Validate amount details
            if(amountsDetail === undefined){
                throw new Error( `${orderSauce.spread} is not a valid sauce spread`);
            }
            toSaveSauce.spread = amountsDetail.name;
            toSaveSauce.calCount = amountsDetail.cal;
            toSaveSauce.price = amountsDetail.price; 

            resolve(toSaveSauce);
        })
        .catch((e) => {
            toSaveSauce.error = e.message;
            // Send back sauce with error message
            resolve(toSaveSauce);
        }); 
    });
};

// Gets us all the sauces details
var updatedSauces = (saucesList) => {
    return new Promise(
        (resolve, reject) => {
            // If we don't have meats
            if(saucesList === undefined){
                // We resolve with an empty list
                resolve([]);
            } else{
                Promise.map(saucesList, updateSauce)
                .then((sauces) => {
                    resolve(sauces);
                }
                , (err) => {
                    reject(err);
                });
            }
        }
    );      
};

module.exports = {
    updatedSauces
};