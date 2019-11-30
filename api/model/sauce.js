const mongoose = require('mongoose');

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


// Populate a few sources into DB
/* var sauces = [
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
];*/

// Create the Crust Model
var Sauce = mongoose.model('Sauce', sauceSchema);

/*
Source.insertMany(sources, (err) => {
    if(err){
        console.log(err);
    }
}); */

module.exports = {
    Sauce
};