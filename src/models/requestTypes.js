const mongoose = require('mongoose');

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
