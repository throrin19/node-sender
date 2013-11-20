var Sender = require('../sender');
var https = require("https");




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
