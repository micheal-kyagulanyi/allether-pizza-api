const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

// Connect to the database
mongoose.connect('mongodb://heroku_s2dbm8j1:61brdf9oupau7j2dkvn89as5sb@ds251158.mlab.com:51158/heroku_s2dbm8j1' || 'mongodb://localhost:/PizzaShopAPI',
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