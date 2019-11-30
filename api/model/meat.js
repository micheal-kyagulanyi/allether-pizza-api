const mongoose = require('mongoose');

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


// Code to populate a few flavored crusts
var meats = [
{
    name: 'Pepperoni',
    spreads: [
        {
            name: 'Lite', 
            amounts: [
                {name: 'Half', cal: 3, price: 0.88},
                {name: 'Full', cal: 5, price: 1.75}
            ]
        },

        {
            name: 'Normal', 
            amounts: [
                {name: 'Half', cal: 5, price: 0.88},
                {name: 'Full', cal: 10, price: 1.75}
            ]
        },

        {
            name: 'Extra', 
            amounts: [
                {name: 'Half', cal: 10, price: 1.75},
                {name: 'Full', cal: 20, price: 3.50}
            ]
        },
    ]
},

{
    name: 'Steak',
    spreads: [
        {
            name: 'Lite', 
            amounts: [
                {name: 'Half', cal: 6, price: 1.75},
                {name: 'Full', cal: 13, price: 3.50}
            ]
        },

        {
            name: 'Normal', 
            amounts: [
                {name: 'Half', cal: 13, price: 1.75},
                {name: 'Full', cal: 25, price: 3.50}
            ]
        },
        {
            name: 'Extra', 
            amounts: [
                {name: 'Half', cal: 25, price: 3.50},
                {name: 'Full', cal: 50, price: 7.00}
            ]
        }
    ]
}
];

// Create the Crust Model
var Meat = mongoose.model('Meat', meatSchema);


Meat.insertMany(meats, (err) => {
    if(err){
        console.log(err);
    }
});

module.exports = {
    Meat
};