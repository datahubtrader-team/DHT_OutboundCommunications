//TODO: Create a folder to contain email templates

exports.sendEmail = (RecipientEmail, name) => {

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
                HTMLPart: '<h3>Dear ' + name + ', welcome to <a href="https://www.mailjet.com/">Mailjet!</a></h3><br />May the delivery force be with you!'
            }]
        },
        json: true
    };

    request(options, function(error, response, body) {
        if (error) throw new Error(error);
        console.log(body);
    });

};