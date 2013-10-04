var Sender = require('../sender');


var toto = Sender.send({
    type : Sender.constants.TYPE_WP,
    message : {
        msge : "Message du push Windows Phone"
    },
    title  : "titre du push windows phone",
    tokens : ["http://db3.notify.live.net/throttledthirdparty/01.00/AAEABg_0lnViR4neLSbyVGgLAgAAAAADAQAAAAQUZm52OjIzOEQ2NDJDRkI5MEVFMEQ","http://db3.notify.live.net/throttledthirdparty/01.00/AQGc37w_JmNRTYL2Qlpir7-9AgAAAAADAQAAAAQUZm52OjIzOEQ2NDJDRkI5MEVFMEQFBkVVTk8wMQ","http://am3.notify.live.net/throttledthirdparty/01.00/AQFFm7vZbJDrSLdf5Y6h-8uCAgAAAAADAQAAAAQUZm52OjIzOEQ2NDJDRkI5MEVFMEQFBkVVV0UwMQ","http://am3.notify.live.net/throttledthirdparty/01.00/AQEqwtf00FpGQLzGGTtlOf65AgAAAAADAQAAAAQUZm52OjIzOEQ2NDJDRkI5MEVFMEQFBkVVV0UwMQ"],
    config : {
        apiKey : "GCM Api-KEY"
    }
}, function(err, response){
    console.log(err);
    console.log(response);
});


console.log(toto);