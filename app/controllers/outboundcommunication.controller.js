const OutboundCommunication = require('../models/outboundcommunication.model.js');
const statusUpdate = require('../Enums/enum.js');

var amqp = require('amqplib/callback_api');

var rest = require('rest-facade');
require('dotenv').config()

// Logger lib
var logger = require('../../node_modules/logger').createLogger(); // logs to STDOUT
var logger = require('../../node_modules/logger').createLogger('development.log'); // logs to a file

// Queue names
var correctQueue = "OutboundCommunication_audit";
var errorQueue = "OutboundCommunication_error";

//Cred for SMS service
const accountSid = process.env.ACCID;
const authToken = process.env.AUTHID;
const client = require('twilio')(accountSid, authToken);

// Create and Save a new Outbound communication
exports.create = (req, res) => {
    // Validate request
    if (!req.body.message) {
        return res.status(400).send({
            message: "Outbound communication msg content can not be empty"
        });
    }
    res.status(201);

    // Create an Outbound communication
    var outboundcommunication = new OutboundCommunication({
        firstName: req.body.firstName || "Unknown firstName",
        lastName: req.body.lastName,
        message: req.body.message,
        email: req.body.email,
        number: req.body.number,
        status: statusUpdate.createRequest

    });

    // Save Outbound communication in the database
    outboundcommunication.save()
        .then(data => {
            res.send(data);

            if (data.email == "" || null) {
                console.log("is empty");
            } else {
                if (data.number == "") {
                    logger.error('Request doesn\'t contain a number ');
                    console.log("Request doesn't include a number");
                } else {
                    SendTextMessage(data.number);
                    logger.info('Service caller supplied a recipient number. Response: ', data.number);
                }
                sendEmail(data.email, data.firstName);
                logger.info('POST outboundcommunication from service caller. Response: ', data);
            }
            addMsgOntoQueue(outboundcommunication.toString(), correctQueue);

        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the Outbound communication."
            });
            logger.error(err.message, "Error occurred while sending an OutboundCommunication ", err);
            addMsgOntoQueue(outboundcommunication.toString(), errorQueue);
        });

};

function addMsgOntoQueue(outbound, queuName) {
    //Connect to Rabbit MQ and publish msg onto the queue
    amqp.connect('amqp://localhost', function(err, conn) {
        conn.createChannel(function(err, ch) {
            var mq = queuName;
            ch.assertQueue(mq, { durable: false });
            ch.sendToQueue(mq, Buffer.from(outbound.toString()));
            //console.log(" [x] Sent %s", outboundcommunication._id.toString());
        });
        setTimeout(function() {
            conn.close();
        }, 500);
    });
}

//TODO: Move this code into a separate folder
function sendEmail(RecipientEmail, name) {

    var request = require("request");
    var test = "Basic " + process.env.APIKEY;
    var options = {
        method: 'POST',
        url: 'https://api.mailjet.com/v3.1/send',
        headers: {
            'cache-control': 'no-cache',
            Authorization: test,
            'Content-Type': 'application/json'
        },
        body: {
            Messages: [{
                From: { Email: process.env.HSEMAIL, Name: name },
                To: [{ Email: RecipientEmail, Name: name }],
                Subject: 'My first Mailjet Email!',
                TextPart: 'Greetings from Mailjet!',
                HTMLPart: '<h3>Dear passenger 1, welcome to <a href="https://www.mailjet.com/">Mailjet!</a></h3><br />May the delivery force be with you!'
            }]
        },
        json: true
    };

    request(options, function(error, response, body) {
        if (error) throw new Error(error);

        console.log(body);
    });

}

//TODO: Move this code into a separate folder
function SendTextMessage(number) {
    client.messages
        .create({
            body: 'From Data Hub Trader\'s OutboundCommunication service',
            from: '+447588691816',
            to: number
        })
        .then(message => console.log(message.sid));
}

// Retrieve and return all Outbound communications from the database.
exports.findAll = (req, res) => {
    OutboundCommunication.find()
        .then(OutboundCommunications => {
            res.send(OutboundCommunications);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving OutboundCommunications."
            });
        });
};

// Find a single outboundcommunication with a OutboundCommunicationId
exports.findOne = (req, res) => {
    OutboundCommunication.findById(req.params.outboundcommunicationId)
        .then(outboundcommunication => {
            if (!outboundcommunication) {
                return res.status(404).send({
                    message: "Outbound communication not found with id " + req.params.outboundcommunicationId
                });
            }
            res.send(outboundcommunication);
        }).catch(err => {
            if (err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "Outbound communication not found with id " + req.params.outboundcommunicationId
                });
            }
            return res.status(500).send({
                message: "Error retrieving outboundcommunication with id " + req.params.outboundcommunicationId
            });
        });
};

// Update a outboundcommunication identified by the outboundcommunicationId in the request
exports.update = (req, res) => {
    // Validate Request
    if (!req.body.content) {
        return res.status(400).send({
            message: "OutboundCommunication content can not be empty"
        });
    }

    // Find outboundcommunication and update it with the request body
    OutboundCommunication.findByIdAndUpdate(req.params.outboundcommunicationId, {
            firstName: req.body.firstName || "Unknown firstName",
            lastName: req.body.lastName,
            message: req.body.message,
            email: req.body.email,
            number: req.body.number,
        }, { new: true })
        .then(outboundcommunication => {
            if (!outboundcommunication) {
                return res.status(404).send({
                    message: "OutboundCommunication not found with id " + req.params.outboundcommunicationId
                });
            }
            res.send(outboundcommunication);
        }).catch(err => {
            if (err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "OutboundCommunication not found with id " + req.params.outboundcommunicationId
                });
            }
            return res.status(500).send({
                message: "Error updating outboundcommunication with id " + req.params.outboundcommunicationId
            });
        });
};

// Delete a outboundcommunication with the specified outboundcommunicationId in the request
exports.delete = (req, res) => {
    OutboundCommunication.findByIdAndRemove(req.params.outboundcommunicationId)
        .then(outboundcommunication => {
            if (!outboundcommunication) {
                return res.status(404).send({
                    message: "OutboundCommunication not found with id " + req.params.outboundcommunicationId
                });
            }
            res.send({ message: "OutboundCommunication deleted successfully!" });
        }).catch(err => {
            if (err.kind === 'ObjectId' || err.name === 'NotFound') {
                return res.status(404).send({
                    message: "OutboundCommunication not found with id " + req.params.outboundcommunicationId
                });
            }
            return res.status(500).send({
                message: "Could not delete outboundcommunication with id " + req.params.outboundcommunicationId
            });
        });
};