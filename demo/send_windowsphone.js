var Sender = require('../sender');


var toto = Sender.send({
    type : Sender.constants.TYPE_WP,
    message : {
        msge : "Node Sender Test Message"
    },
    title  : "un title",
    tokens : "Registration ID here or array IDs",
    config : {
        apiKey : "GCM Api-KEY"
    }
}, function(err, response){
    console.log(err);
    console.log(response);
});


console.log(toto);