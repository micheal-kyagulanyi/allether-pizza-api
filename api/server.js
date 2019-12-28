const express = require('express');
const bodyParser = require('body-parser');

const orderRoutes = require('./routes/order');
const cronRoutes = require('./routes/cron');
const indexRoute = require('./routes/index');

var app = express();
// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// Parse application/json
app.use(bodyParser.json());

// Routes
app.use('/', indexRoute);
app.use('/orders', orderRoutes);
app.use('/crons', cronRoutes);

const port = process.env.PORT || 9000;

// Run the server
app.listen(port, () => {
    console.log(`Server started on port: ${port}`);
})


// https://hungryhowies.hungerrush.com/Order/Menu/399#pizza