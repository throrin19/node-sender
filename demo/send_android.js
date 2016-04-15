var Sender = require('../sender');

Sender.send({
    type : Sender.constants.TYPE_ANDROID,
    message : {
        msge : "Test android push"
    },
    tokens : ["your token"],
    config : {
        apiKey : "GCM Api-KEY",
        ttl : 7200 // Expires 2 hour from now, (default = 3600 = 1h)
    }
}, function(err, response){
    console.log(err);
    console.log(response);
});