var Sender = require('../sender');


var toto = Sender.send({
    type : Sender.constants.TYPE_WP,
    message : {
        msge : "Message "
    },
    tokens : {
        sid : "your sid",
        secret : "your secret",
        url : ["tokenUrl,...."]
    }

}, function(err, response){
    console.log(err);
    console.log(response);
});

