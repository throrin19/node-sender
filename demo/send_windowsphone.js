var Sender = require('../sender');


Sender.send({
    type : Sender.constants.TYPE_WP,
    message : {
        msge : "Message "
    },
    tokens : {
        sid : "your sid",
        secret : "your secret",
        url : ["tokenUrl,...."]
    },
    config : {
        ttl : 7200 // notification time to live (default = 3600 = 1h)
    }

}, function(err, response){
    console.log(err);
    console.log(response);
});

