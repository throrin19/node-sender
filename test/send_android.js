var Sender = require('../sender');

var sender = new Sender();

var messageAndroid = sender.buildMessage(Sender.TYPE_ANDROID, { msge: "Test Message NodeJS" });

sender.send(
    Sender.TYPE_ANDROID,
    messageAndroid,
    "registration ID here",
    { apiKey : "API-KEY GCM" },
    function(err, response){
        console.log(err);
        console.log(response);
    }
);

