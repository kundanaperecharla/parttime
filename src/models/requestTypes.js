const mongoose = require('mongoose');

const requestType = {
    distanceTravelledWithoutFrom: {
        // get groceries, medicines, xerox
        locations: {
            isFixedRoute: false,
            from: null,
            to: {}
        },
    }, distanceTravelledWithFrom: {
        // ride, package
        locations: {
            isFixedRoute: true,
            from: {},
            to: {}
        },
    }, 
};

const demoData = {
    "groceries-medicines-"
}

/**
 * T - user needs to provide the info
groceries-medicines-xerox: {
    locations - distanceTravelledWithoutFrom,
    listOfItems: T,
    modeOfTransport: F,
    price: {
        isFixedPrice: F, depends on distance
        price: groceriesPrice + deliveryCharges
    }

ride-package: {
    distanceTravelledWithFrom
    locations: {
        isFixedRoute: T,
        from: T,
        to: T,
    }, listOfItems: T,
    modeOfTransport: T/F,
    price: {
        isFixedPrice: F, depends on distance
        price: groceriesPrice + deliveryCharges
    }


}
 */

const requestTypesSchema = new mongoose.Schema({
    type: {
        type: String,
        trim: true,
        required: true
    }, isOfNewType: {
        type: Boolean,
        required: true,
        default: false,
    }
});

const RequestTypes = mongoose.model('RequestTypes', requestTypesSchema);

module.exports = RequestTypes;
