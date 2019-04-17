const mongoose = require('mongoose');

const OutboundCommunicationSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    message: String,
    email: String,
    number: String,
    status: String
}, {
    timestamps: true
});

module.exports = mongoose.model('OutboundCommunications', OutboundCommunicationSchema);