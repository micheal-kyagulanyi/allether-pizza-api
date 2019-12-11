const mongoose = require('mongoose');

const {db} = require('../db/database');

// Setup my database
var Schema = mongoose.Schema;

// Create Crust Schema
var crustSizeSchema = new Schema(
    {
        name: String,
        sizes: [
            {
                name: String,
                price: Number,
                calCount: Number,
                slices: Number
            }
        ]
    }
);


 //Script to create CrustAndSize documents
var crustsSizes = [
    {
        name: 'Original Round',
        sizes: [
            {
                name: 'Junior',
                price: 4.00,
                calCount: 135,
                slices: 4
            },
            {
                name: 'Small',
                price: 6.00,
                calCount: 110,
                slices: 6
            },
            {
                name: 'Medium',
                price: 8.00,
                calCount: 135,
                slices: 8
            },
            {
                name: 'Large',
                price: 10.00,
                calCount: 195,
                slices: 8
            },
            {
                name: 'X-Large',
                price: 11.00,
                calCount: 280,
                slices: 8
            },
            {
                name: 'Small',
                price: 6.00,
                calCount: 110,
                slices: 6
            }
        ]
    },
    {
        name: 'Glutten Free',
        sizes: [
            {
                name: 'Small',
                price: 9.00,
                calCount: 50,
                slices: 6
            },
        ] 
    },
    {
        name: 'Thin Crust',
        sizes: [
            {
                name: 'Medium',
                price: 8.00,
                calCount: 95,
                slices: 6
            },
            {
                name: 'Large',
                price: 10.00,
                calCount: 145,
                slices: 8
            }
        ]
    },
    {
        name: 'Stuffed Crust',
        sizes: [
            {
                name: 'Large',
                price: 12.00,
                calCount: 245,
                slices: 8
            }
        ]
    }
]; 

// Create the Crust Model
var CrustSize = mongoose.model('CrustSize', crustSizeSchema);

/* CrustSize.insertMany(crustsSizes, (err) => {
if(err){
    console.log(err);
}
});  */


/*
FUNCTION NAME: updateCrustSize
INPUTS: orderedPizza(object)
OUTPUTS: crustSize(object)
AUTHOR: Michael Kyagulanyi
*/
var updateCrustSize = (orderedPizza) => {
    return new Promise((resolve, reject) => {
        if(orderedPizza.crustSize){
            var crustSize = {};
            // Try getting crust from the DB
            CrustSize.findOne({name: orderedPizza.crustSize.name}).then(
                // Found the crust
                (crust) => {
                    // Get this crust size name
                    var crustInfo = crust.sizes.find((size) => {
                        return size.name === orderedPizza.crustSize.size;
                    });
                    // Update this crust info
                    crustSize.name = crust.name;
                    crustSize.size = crustInfo.name;
                    crustSize.price = crustInfo.price;
                    crustSize.slices = crustInfo.slices;
                    crustSize.calCount = crustInfo.calCount;
    
                   /*  // Update to save pizza
                    toSavePizza.crustSize = crustSize;
                    toSavePizza.price = crustSize.price;
                    toSavePizza.calCount = crustSize.calCount; */

                    // Return toSavePizza
                    resolve(crustSize);
                }, (err) => {
                    reject('Could not find the crust',err);
                }
            );
        }
    });
}

module.exports = {
    updateCrustSize
};