const mongoose = require('mongoose');

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


var toppings = [
    {
        name: 'Feta',
        spreads: [
            {
                name: 'Lite', 
                amounts: [
                    {name: 'Half', cal: 9, price: 0.88},
                    {name: 'Full', cal: 18, price: 1.75}
                ]
            },

            {
                name: 'Normal', 
                amounts: [
                    {name: 'Half', cal: 18, price: 0.88},
                    {name: 'Full', cal: 35, price: 1.75}
                ]
            },

            {
                name: 'Extra', 
                amounts: [
                    {name: 'Half', cal: 35, price: 1.75},
                    {name: 'Full', cal: 70, price: 3.50}
                ]
            },
        ]
    },

    {
        name: 'Black Olive',
        spreads: [
            {
                name: 'Lite', 
                amounts: [
                    {name: 'Half', cal: 4, price: 0.88},
                    {name: 'Full', cal: 8, price: 1.75}
                ]
            },

            {
                name: 'Normal', 
                amounts: [
                    {name: 'Half', cal: 8, price: 0.88},
                    {name: 'Full', cal: 15, price: 1.75}
                ]
            },
            {
                name: 'Extra', 
                amounts: [
                    {name: 'Half', cal: 15, price: 1.75},
                    {name: 'Full', cal: 30, price: 3.50}
                ]
            }
        ]
    }
];

// Create the Crust Model
var Topping = mongoose.model('Topping', toppingSchema);

/* Topping.insertMany(toppings, (err) => {
    if(err){
        console.log(err);
    }
}); */

module.exports = {
    Topping
};