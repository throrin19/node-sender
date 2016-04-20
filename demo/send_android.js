var Sender = require('../sender'),
    bunyan = require('bunyan');

var log = bunyan.createLogger({
    name  : "node-sender",
    level : "info",
    src   : true
});

Sender.send({
    log     : log,                              // Bunyan logger instance (optional)
    type    : Sender.constants.TYPE_ANDROID,    // OS type
    message : {
        title       : "your title",             // notification title 
        body        : "Test android push",      // message to send (optional)
        anyotherKey : "that you want to send"   // other data you want to send, see GCM doc
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