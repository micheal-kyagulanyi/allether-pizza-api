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
                    resolve(crustSize);
                }, (err) => {
                    reject('Could not find the crust',err);
                }
            );
        } else {
            resolve(crustSize);
        }
    });
}

module.exports = {
    updateCrustSize
};