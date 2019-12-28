var totalCal = (list) => {
    sum = 0;
    for(var i = 0; i < list.length; i++){
        sum = sum + list[i].calCount;
    }
    return sum;
};


var totalPrice = (list) => {
    sum = 0;
    for(var i = 0; i < list.length; i++){
        sum = sum + list[i].price;
    }
    return sum;
};

var getSum = (list) => {
    let total = list.reduce(
        (accumulator, element) => {
            if(element.price) {
                return element.price + accumulator;
            } else {
                return element.cal + accumulator;
            } 
        }, 
        0
    );
    return total;
};


// Set up our middleware for express js to help paginate
// results
var paginatedResults = (model) => {
    return async (req, res, next) => {
        // Get page
        const PAGE = parseInt(req.query.page) || 0;
        const LIMIT = parseInt(req.query.limit) || 0;
        const FIELD = req.query.field;
        const ORDER = parseInt(req.query.order)

        // Our databese list is always indexed starting at 0
        const STARTINDEX = (PAGE - 1) * LIMIT;
        const ENDINDEX = PAGE * LIMIT
        
        // Get the total number of records
        const TOTALRECORDS = await model.countDocuments({}, (err, count) => {
            if(!err){
                return count;
            }
        });

        const RESULTS = {};

        // Do we have a next page
        if(ENDINDEX <  TOTALRECORDS && PAGE != 0){
            RESULTS.next = {
                page: PAGE + 1,
                limit: LIMIT
            }
        }

        // Do we have a previous page
        if(STARTINDEX > 0){
            RESULTS.previous = {
                page: PAGE - 1,
                limit: LIMIT
            }
        }

        try{
            RESULTS.results = await model.find().limit(LIMIT).skip(STARTINDEX)
            .sort({FIELD: ORDER});
            res.paginatedResults = RESULTS;
        } catch(e){
            res.status(500).json({messsage: e.message});
        }    
        next();
    }
};


// A function to dynamically update an item
var updateItem = (item, res, toSavePizza) => {

    console.log(res)
    
    // Get object name
    var  itemName = Object.keys(item)[0];
    var eMsg = {}
    // Is this object a crustSize
    if(itemName === 'crustSize'){
        // Update crust
        if(item[itemName] !== undefined){
            // Is the error propery set
            if(item[itemName].error){
               
                eMsg.ERROR = item[itemName].error;
                return res.status(404).send(eMsg);
            }
            toSavePizza[itemName] = item[itemName].crustSize;
            toSavePizza.price += item[itemName].price;
            toSavePizza.calCount += item[itemName].calCount;
            toSavePizza.slices = item[itemName].slices;
            return;
        }
    }

    // Deal with other list items
    if(item[itemName].length > 0){
        // Check if there is any error in the item list
        const itemErr = item[itemName].find((item) => {
            return item.error !== undefined;
        });
        if(itemErr){
            // Display the item error to the user
            eMsg.ERROR = itemErr.error;
            return res.status(404).send(eMsg);
        }
        // If it's a drink don't take a calories count
        if(itemName !== 'drinks'){
            toSavePizza.calCount += totalCal(item[itemName]);
        } 

        toSavePizza[itemName] = item[itemName];
        toSavePizza.price += totalPrice(item[itemName]);
    }
};


module.exports = {
   totalCal,
   totalPrice,
   paginatedResults,
   updateItem
};