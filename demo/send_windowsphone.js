var Sender = require('../sender'),
    bunyan = require('bunyan');

var log = bunyan.createLogger({
    name  : "node-sender",
    level : "info",
    src   : true
});

Sender.send({
    log     : log,                          // Bunyan logger instance (optional)
    type    : Sender.constants.TYPE_WP,     // OS type
    message : {
        msge : "Message "                   // message to send
    },
    tokens  : {
        sid    : "your sid",                // Package Security Identifier (SID)
        secret : "your secret",             // Secret password
        url    : ["tokenUrl,...."]          // phone(s) registration id(s)
    },
    config  : {
        ttl : 7200                          // Time to live, (optional, default = 3600 = 1h)
    }

}, function (err, response) {
    console.log(err);
    console.log(response);
});

