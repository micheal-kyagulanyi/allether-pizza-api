var totalCal = (list) => {
    sum = 0;
    for(var i = 0; i < list.length; i++){
        sum = sum + list[i].calCount;
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




module.exports = {
   getSum
};