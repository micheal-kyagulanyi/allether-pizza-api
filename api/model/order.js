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
        name: {
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


//Create Sample Order here
var o =
{
	"deliveryStatus": "Pending",
	"_id": new ObjectID(),
	"name": "Sally",
	"ipAddress": "192.168.1.55",
	"orderTime": Date.now(),
	"totalPrice": 5.49,
	"totalQuantity": 1,
	"pizzas": [
		{
			"crustSize": {
                "name": "Original Round",
				"size": "Junior",
				"price": 4,
				"slices": 4,
				"calCount": 135
            },
            "cookOptions": "Normal Cook",
			"sauceOptions": [
                {
                    "_id": new ObjectID(),
					"spread": "None",
					"amount": "Lite",
					"name": "Pizza Source",
					"calCount": 5,
					"price": 0.00
                },
                
                {
                    "_id": new ObjectID(),
					"spread": "Half",
					"amount": "Lite",
					"name": "Mozzarella",
					"calCount": 11,
					"price": 0.00
				},
				
			],
			"drinks": [
                {
                    "_id": new ObjectID(),
                    "size": "Medium",
                    "price": 0.5,
                    "name": "Cocacola"
                },
            ], 
			"meats": [
				{
					"spread": "Half",
					"amount": "Lite",
					"_id": new ObjectID(),
					"name": "Pepperoni",
					"calCount": 1,
					"price": 0.5
				}
			],
			"otherToppings": [
				{
                    "_id": new ObjectID(),
					"spread": "Half",
					"amount": "Lite",
					"name": "Parmezzan",
					"calCount": 3,
					"price": 0.99
				}
			],
			"flavoredCrusts": [
				{
					"spread": "Whole",
					"amount": "Lite",
					"_id": new ObjectID(),
					"name": "Original Crust",
					"calCount": 3,
					"price": 0.00
				}
			]
		}
	]
};


 /* var oo = new Order(o);

oo.save((err) => {
    console.log(err);
});  */


module.exports = {
    Order
};