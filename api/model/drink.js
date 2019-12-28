const mongoose = require('mongoose');
const {Promise} = require('bluebird');

const {db} = require('../db/database');

// Setup my database
var Schema = mongoose.Schema;

// Create Source Schema
var drinkSchema = new Schema(
    {
        name: {
            type: String
        },
        sizes: [
            {
               name: String,
               price: Number
            }
        ]
    }
);

// Create the Drink Model
var Drink = mongoose.model('Drink', drinkSchema);

var updateDrink = (orderDrink) => {
    return new Promise((resolve, reject) => {
        var toSaveDrink = {};
        // Try finding meat from the DB
        Drink.findOne({name: orderDrink.name})
        .then((dbDrink) => {
            // Validate drink i.e if the drink exists in the DB
            if(dbDrink === null){
                throw new Error( `${orderDrink.name} is not a valid drink name`);
            }
            // Update to save drink
            toSaveDrink.name = dbDrink.name;

            // Get the drink's size details from the DB
            var amountsDetail = {};
            amountsDetail = dbDrink.sizes.find((size) => {
                return size.name === orderDrink.size;
            });

            // Validate amounts detail
            if(amountsDetail === undefined){
                throw new Error( `${orderDrink.size} is not a valid drink size`);
            }

            // Update drink with this DB info
            toSaveDrink.size = amountsDetail.name;
            toSaveDrink.price = amountsDetail.price;
            resolve(toSaveDrink);
        })
        .catch((e) => {
            toSaveDrink.error = e.message;
            // Send back drink with error message
            resolve(toSaveDrink);
        });
    });
}

// This function uses Promises.map() to return us
// a list of all the updated drinks or
// an empty list if we don't have drinks
var updatedDrinks = (drinksList) => {
    return new Promise(
        (resolve, reject) => {
            // If we don't have drinks
            if(drinksList === undefined){
                // Return an empty list
                resolve([]);
            } else {
                Promise.map(drinksList, updateDrink)
                .then((drinks) => {
                    resolve(drinks);
                }
                , (err) => {
                    reject(err);
                });
            }
        }
    );    
};

module.exports = {
    updatedDrinks
};