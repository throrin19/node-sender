var Sender = require('../sender'),
    bunyan = require('bunyan');

var log = bunyan.createLogger({
    name  : "node-sender",
    level : "info",
    src   : true
});

Sender.send({
    log     : null,                             // Bunyan logger instance (optional)
    type    : Sender.constants.TYPE_ANDROID,    // OS type
    message : {
        msge : "Test android push"              // message to send
    },
    tokens  : ["your token"],                   // phone(s) registration id(s)
    config  : {
        apiKey : "GCM Api-KEY",
        ttl    : 7200                           // Time to live, (optional, default = 3600 = 1h)
    }
}, function (err, response) {
    console.log(err);
    console.log(response);
});