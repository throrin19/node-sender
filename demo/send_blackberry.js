var Sender = require('../sender');


Sender.send({
    type : Sender.constants.TYPE_BB,
    message : {
        "msge" : "Message de test du serveur de push Blackberry"
    },
    tokens : ["your token1, yourtoken2,"],
    config : {
        apiKey : "your api key",
        password : "your password"
    }
}, function(err, response){
    console.log(err);
    console.log(response);
});



