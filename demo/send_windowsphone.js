var Sender = require('../sender');


var toto = Sender.send({
    type : Sender.constants.TYPE_WP,
    message : {
        msge : "Message "
    },
    title  : "titre du push",
    tokens : ["yourtoken, ..."]

}, function(err, response){
    console.log(err);
    console.log(response);
});

