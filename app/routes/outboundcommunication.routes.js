module.exports = (app) => {
    const outboundcommunications = require('../controllers/outboundcommunication.controller.js');

    // Create a new OutboundCommunication
    app.post('/outboundcommunications', outboundcommunications.create);

    // Retrieve all OutboundCommunications
    app.get('/outboundcommunications', outboundcommunications.findAll);

    // Retrieve a single OutboundCommunication with outboundcommunicationId
    app.get('/outboundcommunications/:outboundcommunicationId', outboundcommunications.findOne);

    // Update a OutboundCommunication with outboundcommunicationId
    app.put('/outboundcommunications/:outboundcommunicationId', outboundcommunications.update);

    // Delete a OutboundCommunication with outboundcommunicationId
    app.delete('/outboundcommunications/:outboundcommunicationId', outboundcommunications.delete);
}