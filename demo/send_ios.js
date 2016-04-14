var Sender = require('../sender');

Sender.send({
    type : Sender.constants.TYPE_IOS,
    message : {
        alert : "your notification",
        badge : 1, //your badge
        sound : "cat.caf", //your notification sound
        expiry : Math.floor(Date.now() / 1000) + 3600 // Expires 1 hour from now.
    },
    tokens : ["your token"],
    config : {
        cert : "path to your cert file",
        key : "path to your key file"
    }
}, function(err, response){
    console.log(err);
    console.log(response);
});
