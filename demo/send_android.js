var Sender = require('../sender'),
    bunyan = require('bunyan');

var log = bunyan.createLogger({
    name  : "node-sender",
    level : "info",
    src   : true
});

var sender = Sender.send({
    log     : log,                                  // Bunyan logger instance (optional)
    type    : Sender.constants.TYPE_ANDROID,        // OS type
    message : {
        title         : "your title",               // notification title 
        body          : "Test android push",        // message to send (optional)
        any_other_Key : "that you want to send"     // other data you want to send, see GCM's doc
    },
    tokens  : ["your token"],                       // phone(s) registration id(s)
    config  : {
        apiKey : "GCM Api-KEY",
        ttl    : 7200                               // Time to live, (optional, default = 3600 = 1h)
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
