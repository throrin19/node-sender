var Sender = require('../sender');

Sender.send({
    type : Sender.constants.TYPE_IOS,
    message : {
        alert : "your notification",
        badge : 1, //your badge
        sound : "cat.caf" //your notification sound
    },
    tokens : ["your token"],
    config : {
        cert : "path to your cert file",
        key : "path to your key file",
        ttl : 7200 // Expires 2 hour from now, (default = 3600 = 1h)
    }
}, function(err, response){
    console.log(err);
    console.log(response);
});
