const mongoose = require('mongoose');

const {db} = require('../db/database');

// Setup my database
var Schema = mongoose.Schema;

// Create Crust Schema
var crustSizeSchema = new Schema(
    {
        name: {
            type: String
        },
        size: {
            type: String,
        },
        price: {
            type: Number,
            default: Date.now
        },
        calCount: {
            type: Number,
        },
        slices: {
            type: Number,
        }
      
    }
);


 //Script to create CrustAndSize documents
var crustsSizes = [
    {
        name: 'Original Round',
        size: 'Junior',
        price: 4.00,
        calCount: 135,
        slices: 4
    },
    {
        name: 'Original Round',
        size: 'Small',
        price: 6.00,
        calCount: 110,
        slices: 6
    },
    {
        name: 'Original Round',
        size: 'Medium',
        price: 8.00,
        calCount: 135,
        slices: 8
    },
    {
        name: 'Original Round',
        size: 'Large',
        price: 10.00,
        calCount: 195,
        slices: 8
    },
    {
        name: 'Original Round',
        size: 'X-Large',
        price: 11.00,
        calCount: 280,
        slices: 8
    },
    {
        name: 'Original Round',
        size: 'Small',
        price: 6.00,
        calCount: 110,
        slices: 6
    },
    {
        name: 'Glutten Free',
        size: 'Small',
        price: 9.00,
        calCount: 50,
        slices: 6
    },
    {
        name: 'Thin Crust',
        size: 'Medium',
        price: 8.00,
        calCount: 95,
        slices: 6
    },
    {
        name: 'Thin Crust',
        size: 'Large',
        price: 10.00,
        calCount: 145,
        slices: 8
    },
    {
        name: 'Stuffed Crust',
        size: 'Large',
        price: 12.00,
        calCount: 245,
        slices: 8
    }
]; 

// Create the Crust Model
var CrustSize = mongoose.model('CrustSize', crustSizeSchema);

 CrustSize.insertMany(crustsSizes, (err) => {
    if(err){
        console.log(err);
    }
}); 

module.exports = {
    CrustSize
};