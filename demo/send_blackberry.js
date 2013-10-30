var Sender = require('../sender');
var https = require("https");

https.globalAgent.options.secureProtocol = 'SSLv3_method';


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
