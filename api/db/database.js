const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

// Connect to the database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/PizzaShopAPI',
    { 
        useUnifiedTopology: true, 
        useNewUrlParser: true,
    }
);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
   console.log('DB successfully connected.');
});
 
module.exports = {
    db
}