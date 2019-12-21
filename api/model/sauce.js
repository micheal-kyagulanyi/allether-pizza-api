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


Sauce.insertMany(sauces, (err) => {
    if(err){
        console.log(err);
    }
});

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