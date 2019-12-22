const mongoose = require('mongoose');
var {ObjectID} = require('mongodb');

const {db} = require('../db/database');

// Setup my database
var Schema = mongoose.Schema;

// Create pizza child schema
var pizzaSchema = new Schema(
    { 
        crustSize: {
            name: {
                type: String,
                default: 'Original Round'
            },
            size: {
                type: String,
                default: 'Junior'
            },
            price: {
                type: Number,
                default: 4.00
            },
            slices: {
                type: Number,
                default: 4
            },
            calCount: {
                type: Number,
                default: 135
            }
        },
        cookOptions: {
            type: String,
            default: 'Normal Cook',
        },
        sauceOptions: [
            {
               name: {
                   type: String
               },
               spread: {
                    type: String,
                    default: 'Half'
                },
                amount: {
                    type: String,
                    default: 'Lite'
                },
                calCount: {
                    type: Number,
                },
                price: {
                    type: Number,
                },
            }
        ],
        meats: [
            {
               name: {
                   type: String
               },
               spread: {
                    type: String,
                    default: 'Half'
                },
                amount: {
                    type: String,
                    default: 'Lite'
                },
                calCount: {
                    type: Number,
                },
                price: {
                    type: Number,
                },
            }
        ],
        otherToppings: [
            {
                name: {
                    type: String,
                },
                spread: {
                     type: String,
                     default: 'Half'
                 },
                 amount: {
                     type: String,
                     default: 'Lite'
                 },
                 calCount: {
                     type: Number,
                 },
                 price: {
                     type: Number,
                 },
             }
        ],
        flavoredCrusts: [
            {
                name: {
                    type: String,
                },
                spread: {
                    type: String,
                    default: 'Half'
                 },
                 amount: {
                    type: String,
                    default: 'Lite'
                 },
                 calCount: {
                    type: Number
                 }
            }
        ],
        drinks : [
            {
                name : {
                    type: String,
                    
                },
                size : {
                    type: String,
                    default: 'Small'
                },
                price : {
                    type: Number,
                    default: 0.5
                }
            }
        ],
        quantity : {
            type: Number,
        },
        price : {
            type: Number,
        },
        calCount : {
            type: Number,
        }
    }
);

// Create Order Schema
var orderSchema = new Schema(
    {
        orderName: {
            type: String
        },
        ipAddress: {
            type: String,
        },
        orderTime: {
            type: Date,
            default: Date.now
        },
        deliveryStatus: {
            type: String,
            default: 'Pending',
        },
        totalPrice: {
            type: Number,
        },
        totalQuantity: {
            type: Number,
        },
        pizzas: [pizzaSchema]
    }
);

// Create the Order Model
var Order = mongoose.model('Order', orderSchema);

module.exports = {
    Order
};