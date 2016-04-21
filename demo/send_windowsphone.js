var Sender = require('../sender'),
    bunyan = require('bunyan');

var log = bunyan.createLogger({
    name  : "node-sender",
    level : "info",
    src   : true
});

var sender = Sender.send({
    log     : log,                          // Bunyan logger instance (optional)
    type    : Sender.constants.TYPE_WP,     // OS type
    message : {
        msge : "Message "                   // message to send
    },
    tokens  : {
        url : ["tokenUrl,...."]             // phone(s) registration id(s)
    },
    config  : {
        sid    : "your sid",                // Package Security Identifier (SID)
        secret : "your secret",             // Secret password
        ttl    : 7200                       // Time to live, (optional, default = 3600 = 1h)
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