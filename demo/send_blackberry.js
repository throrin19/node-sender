var Sender = require('../sender');


/*
Sender.send({
    type : Sender.constants.TYPE_BB,
    message : {
        msge : "Node Sender Test Message"
    },
    tokens : "Registration ID here or array IDs",
    config : {
        apiKey : "GCM Api-KEY"
    }
}, function(err, response){
    console.log(err);
    console.log(response);
});

    */


var toto = Sender._buildMessage(Sender.constants.TYPE_BB, {
        message : {
            msge : "Node Sender Test Message"
        },

    tokens : "Registration ID here or array IDs",
    config : {
    apiKey : "GCM Api-KEY"

    }
});


console.log(toto);