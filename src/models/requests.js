const mongoose = require('mongoose');

const requestsSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: true,
    }, workNotes: [{
        // By both customer and helper
        // Format - 2022-02-25 15:20:00 - Kundana\nPlease add 1kg carrot to the list
        type: String,
        trim: true
    }], status: {
        type: String,
        required: true,
        enum: ['draft', 'pendingDispatch', 'assigned', 'workFinishedPaymentPending', 'complete', 'incomplete', 'cancelled'],
        default: 'draft'
        /**
         * draft - owner is creating/editing a request
         * pendingDispatch - request ready to be taken up by a helper
         * assigned - a helper has accepted to work on the request and started working on it
         * workFinishedPaymentPending - work complete, waiting for payment
         * complete - payment also complete, request has been successfully completed
         * incomplete - helper can no longer work on the request
         * cancelled - owner has cancelled the request
         */
    }, type: {
        type: mongoose.Schema.Types.ObjectId,
        // required: true, TODO
        ref: 'RequestTypes'
    }, owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Users'
    }, assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        default: null,
        // required: true
    }, id: { // Used when request goes into incomplete state and new helper picks it up - but the old helper still has to see the history
        type: String
    }, requestDetails: {
        distance: {
            // from: { // todo

            // }, to: {

            // }, 
            kms: {
                type: Number,
                default: 0
            }
        }, time: {
            // estimatedTime: { // todo: get from google maps api

            // }, actualTime: {
                
            // }, waitingTime: {

            // }
        }, cost: {
            travelCost: {
                type: Number,
                default: 0
            }, skillCost: {
                type: Number,
                default: 0
            }, timeCost: {
                type: Number,
                default: 0
            }, extraRequestsCharges: {
                type: Number,
                default: 0
            }, taxes: {
                type: Number,
                default: 0
            }, otherCosts: {
                type: Number,
                default: 0
            }
        }, 
    }
}, {
    timestamps: true
});

requestsSchema.index({ id: 1, assignedTo: 1 }, { unique: true });

requestsSchema.methods.toJSON = function () {
    const request = this;
    const clonedRequest = request.toObject();

    delete clonedRequest.__v;
    delete clonedRequest.id;

    return clonedRequest;
};

const Requests = mongoose.model('Requests', requestsSchema);

module.exports = Requests;
