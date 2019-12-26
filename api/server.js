const express = require('express');
const bodyParser = require('body-parser');

const orderRoutes = require('./routes/order');
const cronRoutes = require('./routes/cron');

var app = express();
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// Routes
app.use('/orders', orderRoutes);
app.use('/crons', cronRoutes);

const port = process.env.PORT || 9000;


// Run the server
app.listen(port, () => {
    console.log(`Server started on port: ${port}`);
})


// https://hungryhowies.hungerrush.com/Order/Menu/399#pizza