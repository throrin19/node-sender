var Sender = require('../sender');


Sender.send({
    type : Sender.constants.TYPE_BB,
    message : {
        "msge" : "Message de test du serveur de push Blackberry"
    },
    tokens : ["635282030"],
    config : {
        apiKey : "40-82e7a73596il7rkI29933r3M8884y4a5R21e8",
        password : "3S4T7u9m"
    }
}, function(err, response){
    console.log(err);
    console.log(response);
});



//your token