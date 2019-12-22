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

// Create the Crust Model
var CrustSize = mongoose.model('CrustSize', crustSizeSchema);

var updateCrustSize = (orderedPizza) => {
    return new Promise((resolve, reject) => {
        var crustSize = {};
        if(orderedPizza.crustSize){
            // Try getting crust from the DB
            CrustSize.findOne({name: orderedPizza.crustSize.name}).then(
                // Found the crust
                (dbCrust) => {
                    // Handle non DB existing crust
                    if(dbCrust === null){
                        throw new Error(`${orderedPizza.crustSize.name} is not a valid crust name`);
                    }

                    //Get this crust's details
                    var crustInfo = {}
                    crustInfo = dbCrust.sizes.find((size) => {
                        return size.name === orderedPizza.crustSize.size;
                    });
                    
                    // Handle non existing crust details
                    if(crustInfo === undefined){
                        throw new Error(`${orderedPizza.crustSize.size} is not a valid size`);
                    }
                   
                    // Update this crust info
                    crustSize.name = dbCrust.name;
                    crustSize.size = crustInfo.name;
                    crustSize.price = crustInfo.price;
                    crustSize.slices = crustInfo.slices;
                    crustSize.calCount = crustInfo.calCount;
                    resolve(crustSize);
                })
                .catch((e) => {
                   crustSize.error = e.message;
                   // Send back crust with error message
                   resolve(crustSize);
                });
        } else {
            // Send back empty crust
            resolve(crustSize);
        }
    });
}

module.exports = {
    updateCrustSize
};