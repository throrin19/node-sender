var Sender = require('../sender');


var toto = Sender.send({
    type : Sender.constants.TYPE_BB,
    message : {
        "msge" : "Node Sender Test Message"
    },
    tokens : ["token1" ,"token2" ,"token3"],
    config : {
        apiKey : "GCM Api-KEY",
        password : "PASSWORD"
    }
}, function(err, response){
    console.log(err);
    console.log(response);
});


console.log(toto);