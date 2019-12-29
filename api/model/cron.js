const mongoose = require('mongoose');
var {ObjectID} = require('mongodb');


// Setup my database
var Schema = mongoose.Schema;

const cronSchema = new Schema({
    // Using popullation to reference the Order Model
    orders: [{type: Schema.Types.ObjectId, ref: 'Order'}]
});

// Create the Cron Model
var Cron = mongoose.model('Cron', cronSchema);

module.exports = {
    Cron
};