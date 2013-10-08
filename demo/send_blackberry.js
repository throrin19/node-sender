var Sender = require('../sender');


Sender.send({
    type : Sender.constants.TYPE_BB,
    message : {
        "msge" : "Message de test du serveur de push Blackberry"
    },
    tokens : ["635282030","553648138","BBSIMULATOR_9800_553648138","BBSIMULATOR_9300_553648138","BBSIMULATOR_9900_553648138","585841893","584082161","690430153"],
    config : {
        apiKey : "40-8729950B0i57RRR22o30c1M0t9y5a96o219k9",
        password : "3S4T7u9m"
    }
}, function(err, response){
    console.log(err);
    console.log(response);
});



