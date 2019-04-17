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
const dbConfig = require('./config/database.config.js');
const mongoose = require('mongoose');

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
    res.json({ "message": "Welcome to Contact service. Creating a new outboundcommunication. Organise and and store cusotmer outboundcommunication details." });
});

require('./app/routes/outboundcommunication.routes.js')(app);

app.all('', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', "Origin, X-Requested-With, Content-Type, Accept, Authorization");
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

opn('http://localhost:5000/api-docs')

// listen for requests
app.listen(5000, () => {
    console.log("Server is listening on port 5000");
});