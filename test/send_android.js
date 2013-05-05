var Sender = require('../sender');

var sender = new Sender();

sender.send(
    Sender.TYPE_ANDROID,                // OS type
    { msge : "Test Message NodeJS" },   // message to send
    "Registration Id",                  // phone registration id(s)
    { apiKey : "Api-Key GCM" },         // settings
    function(err, response){            // callback
        console.log(err);
        console.log(response);
    }
);