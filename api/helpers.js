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
        const PAGE = parseInt(req.query.page);
        const LIMIT = parseInt(req.query.limit);
        const FIELD = req.query.field;
        const ORDER = parseInt(req.query.order)

        // Our databese list is always indexed starting at 0
        const STARTINDEX = (PAGE - 1) * LIMIT;
        const ENDINDEX = PAGE * LIMIT;

        const RESULTS = {};

        // Do we have a next page
        if(ENDINDEX <  model.length){
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
}


module.exports = {
   totalCal,
   totalPrice,
   paginatedResults
};