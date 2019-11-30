const mongoose = require('mongoose');

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

// Script to add flavored crusts
 var drinks = [
    {
        name: 'Cocacola',
        sizes: [
            {
                name: 'Small', 
                price: 0.50
            },

            {
                name: 'Medium', 
                price: 1.50
            },

            {
                name: 'Large', 
                price: 2.60
            },
        ]
    },
    {
        name: 'Pepsi',
        sizes: [
            {
                name: 'Small', 
                price: 0.70
            },

            {
                name: 'Medium', 
                price: 1.90
            },

            {
                name: 'Large', 
                price: 2.80
            },
        ]
    },

    {
        name: 'Dr. Pepper',
        sizes: [
            {
                name: 'Small', 
                price: 1.00
            },

            {
                name: 'Medium', 
                price: 2.00
            },

            {
                name: 'Large', 
                price: 3.50
            },
        ]
    },


];

// Create the Crust Model
var Drink = mongoose.model('Drink', drinkSchema);

Drink.insertMany(drinks, (err) => {
    if(err){
        console.log(err);
    }
});

module.exports = {
    Drink
};