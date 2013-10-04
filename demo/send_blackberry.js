var Sender = require('../sender');


var toto = Sender.send({
    type : Sender.constants.TYPE_BB,
    message : {
        "msge" : "Message de test du serveur de push Blackberry"
    },
    tokens : ["635282030","585841893","584082161","690430153"],
    config : {
        apiKey : "40-8729950B0i57RRR22o30c1M0t9y5a96o219k9",
        password : "3S4T7u9m"
    }
}, function(err, response){
    console.log(err);
    console.log(response);
});


console.log(toto);