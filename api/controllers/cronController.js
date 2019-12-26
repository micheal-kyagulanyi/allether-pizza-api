// Get all require npm modules
const {ObjectID} = require('mongodb');
const {Promise} = require('bluebird');
const cron =require('node-cron');
const _ = require('lodash');
require('deepdash')(_); 

// Get all the required models moduels to process an order
var {Order} = require('./../model/order');
var {updateCrustSize} = require('./../model/crustsize');
var {updatedMeats} = require('./../model/meat');
var {updatedFlavoredCrusts} = require('./../model/flavoredcrust');
var {updatedSauces} = require('./../model/sauce');
var {updatedDrinks} = require('./../model/drink');
var {updatedToppings} = require('./../model/topping');

// Get all the helper functions
var {totalCal, totalPrice} = require('./../helpers');




// POST: Create an Order cron job
exports.createCronJob = (req, res) => {
    cron.schedule('* * * * * *', () => {
        console.log('Creating an order every minute');
    });
};

