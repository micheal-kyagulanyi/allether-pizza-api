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

// Create the Crust Model
var Sauce = mongoose.model('Sauce', sauceSchema);

var updateSauce = (orderSauce) => {
    return new Promise((resolve, reject) => {  
        var toSaveSauce = {};
        Sauce.findOne({name: orderSauce.name})
        .then((dbSauce) => {
        
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

            resolve(toSaveSauce);
        },
        (err) => {
            resolve('DB error', err);
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