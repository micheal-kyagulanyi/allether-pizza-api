const mongoose = require('mongoose');
const {Promise} = require('bluebird');

const {db} = require('../db/database');


// Setup my database
var Schema = mongoose.Schema;

// Create Source Schema
var toppingSchema = new Schema(
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
// Create the Topping Model
var Topping = mongoose.model('Topping', toppingSchema);

// This function takes in a topping object 
// and returns an updated topping object with DB info
var updateTopping = (orderTopping) => {
    return new Promise((resolve, reject) => {
        // Create updated topping
        toSaveTopping = {};
        // Get topping from the DB
        Topping.findOne({name: orderTopping.name})
        .then((dbTopping) => {
            // Update the topping with DB data
            toSaveTopping.name = dbTopping.name;
            // Get spread details from the DB
            var dbSpread = dbTopping.spreads.find(
                (spread) =>{
                    return spread.name === orderTopping.amount;
                } 
            );
            toSaveTopping.amount = dbSpread.name;
            // Get spread details from the DB
            var amountsDetail = dbSpread.amounts.find((amount) => {
                return amount.name === orderTopping.spread;
            });
            toSaveTopping.spread = amountsDetail.name;
            toSaveTopping.calCount = amountsDetail.cal;
            toSaveTopping.price = amountsDetail.price; 
            resolve(toSaveTopping);
        },(dbError) => {
            reject(dbError);
        })
    });
};

// This function uses Promises.map() to return us
// a list of all the updated toppings or
// an empty list if we don't have toppings
var updatedToppings = (toppingsList) => {
    return new Promise(
        (resolve, reject) => {
            // If we don't have toppings
            if(toppingsList === undefined){
                // Return an empty list
                resolve([]);
            } else {
                Promise.map(toppingsList, updateTopping)
                .then((toppings) => {
                    // Resolve with updated toppings
                    resolve(toppings);
                }
                , (err) => {
                    reject(err);
                });
            }
        }
    );    
}; 




module.exports = {
    updatedToppings
};