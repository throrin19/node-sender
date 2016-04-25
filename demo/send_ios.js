var Sender = require('../sender'),
    bunyan = require('bunyan');

var log = bunyan.createLogger({
    name  : "node-sender",
    level : "info",
    src   : true
});

var sender = Sender.send({
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
        ttl  : 7200,                        // Time to live, (optional, default = 3600 = 1h)
        production : true                   // If your application is on the production APNS
    }
});
sender.on("successful", (token) => {
    // Each successful push triggers this event with the token and message_id.
});
sender.on("failed", (err) => {
    // Each failed push triggers this event with the token and the statusCode or error.
});
sender.on("unregistered", (token) => {
    // Each push where the device is not registered (uninstalled app).
});
sender.on("end", (results) => {
    // Contains success, failed and unregistered notifications responses data (if there are some).
});
