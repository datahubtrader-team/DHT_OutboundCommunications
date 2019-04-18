const OutboundCommunication = require('../models/outboundcommunication.model.js');
const statusUpdate = require('../Enums/enum.js');

var amqp = require('amqplib/callback_api');

var rest = require('rest-facade');
require('dotenv').config()



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
            //res.end("Test");
            addMsgOntoQueue(outboundcommunication.toString());
            sendEmail();
            //console.log(res.body);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the Outbound communication."
            });
        });




    // var OutboundMsg = new rest.Client('http://localhost:3002/communications');
    // OutboundMsg
    //     .create({
    //         firstName: req.body.firstName,
    //         lastName: req.body.lastName,
    //         message: req.body.message,
    //         email: req.body.email,
    //         service: req.body.service,
    //         status: statusUpdate.createRequest
    //     })
    //     .then(function(user) {
    //         console.log('OutboundMsg created');
    //     });


    // Sending email to customers


    // var request = require("request");

    // var options = {
    //     method: 'POST',
    //     url: 'http://localhost:3002/communications',
    //     body: {
    //         firstName: req.body.firstName,
    //         lastName: req.body.lastName,
    //         message: req.body.message,
    //         email: req.body.email,
    //         service: req.body.service,
    //         status: statusUpdate.createRequest
    //     },
    //     json: true

    // };

    // console.log(options);

    // request(options, function(error, response, body) {
    //     if (error) throw new Error(error);

    //     console.log(body);
    // });

};

var outbound;
function addMsgOntoQueue(outbound){
     //Connect to Rabbit MQ and publish msg onto the queue
     amqp.connect('amqp://localhost', function(err, conn) {
        conn.createChannel(function(err, ch) {
            var mq = 'OutboundCommunication_audit';
            ch.assertQueue(mq, { durable: false });
            ch.sendToQueue(mq, Buffer.from(outbound.toString()));
            //console.log(" [x] Sent %s", outboundcommunication._id.toString());
        });
        setTimeout(function() {
            conn.close();
        }, 500);
    });
}


function sendEmail(){
    
    var request = require("request");
var test = "Basic " +process.env.APIKEY;
var options = { method: 'POST',
  url: 'https://api.mailjet.com/v3.1/send',
  headers: 
   { 'Postman-Token': '1078ab89-b4e0-405e-8e35-b50fb8c6d793',
     'cache-control': 'no-cache',
     Authorization: test,
     'Content-Type': 'application/json' },
  body: 
   { Messages: 
      [ { From: { Email: 'info@hammsolutions.co.uk', Name: 'Me' },
          To: [ { Email: 'julianhamm1@gmail.com', Name: 'You' } ],
          Subject: 'My first Mailjet Email!',
          TextPart: 'Greetings from Mailjet!',
          HTMLPart: '<h3>Dear passenger 1, welcome to <a href="https://www.mailjet.com/">Mailjet!</a></h3><br />May the delivery force be with you!' } ] },
  json: true };

request(options, function (error, response, body) {
  if (error) throw new Error(error);

  console.log(body);
});

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
            //title: req.body.title || "Untitled OutboundCommunication",
            //content: req.body.content
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