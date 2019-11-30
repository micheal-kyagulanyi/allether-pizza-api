const mongoose = require('mongoose');

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

// Script to add flavored crusts
/* var flavoredCrusts = [
    {
        name: 'Original Crust',
        spreads: [
            {
                name: 'Lite', 
                amounts: [
                    {name: 'Half', cal: 0, price: 0.00},
                    {name: 'Full', cal: 0, price: 0.00}
                ]
            },

            {
                name: 'Normal', 
                amounts: [
                    {name: 'Half', cal: 0, price: 0.00},
                    {name: 'Full', cal: 0, price: 0.00}
                ]
            },

            {
                name: 'Extra', 
                amounts: [
                    {name: 'Half', cal: 0, price: 0.00},
                    {name: 'Full', cal: 0, price: 0.00}
                ]
            },
        ]
    },

    {
        name: 'Butter Crust',
        spreads: [
            {
                name: 'Lite', 
                amounts: [
                    {name: 'Half', cal: 8, price: 0.00},
                    {name: 'Full', cal: 15, price: 0.00}
                ]
            },

            {
                name: 'Normal', 
                amounts: [
                    {name: 'Half', cal: 15, price: 0.00},
                    {name: 'Full', cal: 30, price: 0.00}
                ]
            },
            {
                name: 'Extra', 
                amounts: [
                    {name: 'Half', cal: 30, price: 0.00},
                    {name: 'Full', cal: 60, price: 0.00}
                ]
            }
        ]
    }
];*/

// Create the Crust Model
var FlavoredCrust = mongoose.model('FlavoredCrust', flavoredCrustSchema);
/*
FlavoredCrust.insertMany(flavoredCrusts, (err) => {
    if(err){
        console.log(err);
    }
}) */

module.exports = {
    FlavoredCrust
};