const express = require('express');
const bodyParser = require('body-parser');
swaggerUi = require('swagger-ui-express'),
    swaggerDocument = require('./swagger.json');

const opn = require('opn')

// create express app
const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// parse application/json
app.use(bodyParser.json())

// Configuring the database
const dbConfig = require('../config/database.config');
const mongoose = require('mongoose');

const db = require('../config');

mongoose.Promise = global.Promise;

// Connecting to the database
mongoose.connect(dbConfig.url, {
    useNewUrlParser: true
}).then(() => {
    console.log("Successfully connected to the database");
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
});

// define a simple route
app.get('/', (req, res) => {
    res.json({ "message": "Welcome to the Outbound communications service. Sending outbound communications to Customers via Email, SMS or WhatsApp. Organise and and store cusotmer outbound communication details." });
});

//TODO: Write a function to check status of DB and network and then return OK status: https://github.com/deadlysyn/node-healthcheck/blob/master/app.js

// define a simple route
app.get('/healthcheck', (req, res) => {
    var mongojs = require('mongojs')
    var db = mongojs(dbConfig.url, ['outboundcommunication'])

    db.on('error', function(err) {
        console.log('database error', err)
    })

    db.on('connect', function() {
        console.log('database connected')
    })
    res.json({ status: 'UP' });
});

require('./routes/outboundcommunication.routes.js')(app);

app.all('', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', "Origin, X-Requested-With, Content-Type, Accept, Authorization");
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

opn('http://localhost:5000/api-docs')


let { nextAvailable } = require('node-port-check');
// listen for requests
var server = app.listen(5000, () => {
    console.log("Server is listening on port " + server.address().port);
    //TODO: Check if current port is occupied and if so reassign the server to the next available port: https://www.npmjs.com/package/node-port-check

});

db.init();
db.connect("mongodb://localhost:27017/outboundcommunication");