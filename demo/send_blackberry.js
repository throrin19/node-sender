var Sender = require('../sender');
var https = require("https");

https.globalAgent.options.secureProtocol = 'SSLv3_method';


//http://localhost:3000/v1
Sender.send({
    type : Sender.constants.TYPE_BB,
    message : {
        "msge" : "Message de test du serveur de push Blackberry"
    },
    tokens : ["token"],
    config : {
        apiKey : "apikey",
        password : "password"
    }
}, function(err, response){
    console.log(err);
    console.log(response);
});



// prod : 40-82e7a73596il7rkI29933r3M8884y4a5R21e8
//dev : 40-8729950B0i57RRR22o30c1M0t9y5a96o219k9

//your token