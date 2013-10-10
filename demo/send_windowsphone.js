var Sender = require('../sender');


var toto = Sender.send({
    type : Sender.constants.TYPE_WP,
    message : {
        msge : "Message "
    },
    title  : "titre du push",
    tokens : ["yourtoken, ..."]

}, function(err, response){
    console.log(err);
    console.log(response);
});


console.log(toto);
/*
{"id":44,"tokens":["http://am3.notify.live.net/throttledthirdparty/01.00/AQF1ozBtCDC2TZ1tec6uzvTMAgAAAAADQQAAAAQUZm52OkJCMjg1QTg1QkZDMkUxREQFBkxFR0FDWQ","http://db3.notify.live.net/throttledthirdparty/01.00/AAGFXYYf9DFMSLq3T0bLHbqIAgAAAAADAQAAAAQUZm52OjIzOEQ2NDJDRkI5MEVFMEQ","http://db3.notify.live.net/throttledthirdparty/01.00/AAHa8ikb-VblQpHmN1iHQG5WAgAAAAADUwAAAAQUZm52OkJCMjg1QTg1QkZDMkUxREQ","http://am3.notify.live.net/throttledthirdparty/01.00/AQF_HvemnBkkQZC1_g0h8JTNAgAAAAADiwYAAAQUZm52OkJCMjg1QTg1QkZDMkUxREQFBkxFR0FDWQ","http://am3.notify.live.net/throttledthirdparty/01.00/AQF1ozBtCDC2TZ1tec6uzvTMAgAAAAADQQAAAAQUZm52OkJCMjg1QTg1QkZDMkUxREQFBkxFR0FDWQ","http://db3.notify.live.net/throttledthirdparty/01.00/AAGFXYYf9DFMSLq3T0bLHbqIAgAAAAADAQAAAAQUZm52OjIzOEQ2NDJDRkI5MEVFMEQ","http://db3.notify.live.net/throttledthirdparty/01.00/AAHa8ikb-VblQpHmN1iHQG5WAgAAAAADUwAAAAQUZm52OkJCMjg1QTg1QkZDMkUxREQ","http://am3.notify.live.net/throttledthirdparty/01.00/AQF_HvemnBkkQZC1_g0h8JTNAgAAAAADiwYAAAQUZm52OkJCMjg1QTg1QkZDMkUxREQFBkxFR0FDWQ"],"payload":{"aps":{"alert":"sdsq","badge":1,"sound":"cat.caf"},"a":{"a1":44,"a2":"","a3":"","a4":""}}}
windows phone
{"id":44,"tokens":["http://db3.notify.live.net/throttledthirdparty/01.00/AAEABg_0lnViR4neLSbyVGgLAgAAAAADAQAAAAQUZm52OjIzOEQ2NDJDRkI5MEVFMEQ","http://am3.notify.live.net/throttledthirdparty/01.00/AQGoId9KEtGiQYMPlDLmuGLHAgAAAAADAQAAAAQUZm52OjIzOEQ2NDJDRkI5MEVFMEQFBkVVV0UwMQ","http://am3.notify.live.net/throttledthirdparty/01.00/AQFFm7vZbJDrSLdf5Y6h-8uCAgAAAAADAQAAAAQUZm52OjIzOEQ2NDJDRkI5MEVFMEQFBkVVV0UwMQ","http://am3.notify.live.net/throttledthirdparty/01.00/AQEqwtf00FpGQLzGGTtlOf65AgAAAAADAQAAAAQUZm52OjIzOEQ2NDJDRkI5MEVFMEQFBkVVV0UwMQ","http://db3.notify.live.net/throttledthirdparty/01.00/AAEABg_0lnViR4neLSbyVGgLAgAAAAADAQAAAAQUZm52OjIzOEQ2NDJDRkI5MEVFMEQ","http://am3.notify.live.net/throttledthirdparty/01.00/AQGoId9KEtGiQYMPlDLmuGLHAgAAAAADAQAAAAQUZm52OjIzOEQ2NDJDRkI5MEVFMEQFBkVVV0UwMQ","http://am3.notify.live.net/throttledthirdparty/01.00/AQFFm7vZbJDrSLdf5Y6h-8uCAgAAAAADAQAAAAQUZm52OjIzOEQ2NDJDRkI5MEVFMEQFBkVVV0UwMQ","http://am3.notify.live.net/throttledthirdparty/01.00/AQEqwtf00FpGQLzGGTtlOf65AgAAAAADAQAAAAQUZm52OjIzOEQ2NDJDRkI5MEVFMEQFBkVVV0UwMQ"],"payload":{"aps":{"alert":"dqsdqs","badge":1,"sound":"cat.caf"},"a":{"a1":44,"a2":"","a3":"","a4":""}}}
windows phone

    */