var Sender = require('../sender'),
    bunyan = require('bunyan');

var log = bunyan.createLogger({
    name  : "node-sender",
    level : "info",
    src   : true
});

Sender.send({
    log     : log,                          // Bunyan logger instance (optional)
    type    : Sender.constants.TYPE_IOS,    // OS type
    message : {
        alert : "your notification",        // message to send
        badge : 1,                          // your badge
        sound : "cat.caf"                   // your notification sound
    },
    tokens  : ["your token"],               // phone(s) registration id(s)
    config  : {
        cert : "path to your cert file",
        key  : "path to your key file",
        ttl  : 7200                         // Time to live, (optional, default = 3600 = 1h)
    }
}, function (err, response) {
    console.log(err);
    console.log(response);
});
