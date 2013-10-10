var Sender = require('../sender');

Sender.send({
    type : Sender.constants.TYPE_ANDROID,
    message : {
        msge : "Test android push"
    },
    tokens : ["your token"],
    config : {
        apiKey : "GCM Api-KEY"
    }
}, function(err, response){
    console.log(err);
    console.log(response);
});