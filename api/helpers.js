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


module.exports = {
    totalCal,
    totalPrice
}