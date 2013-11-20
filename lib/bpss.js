var PushAbstract    = require('./push_abstract'),
    request         = require('request'),
    https           = require("https"),
    http            = require("http"),
    https           = require("https"),
    constants       = require('constants'),
    _                = require("underscore");


https.globalAgent.options.secureProtocol = 'SSLv3_method';

var Bpss = function(){

}

Bpss.prototype = new PushAbstract();

/**
 * Android Bpss Server URI
 * @type {string}
 * @const
 */
Bpss.SERVER_URI = 'https://cp40.pushapi.na.blackberry.com/mss/PD_pushRequest';


/**
 * API Key
 *
 * @type {string}
 * @private
 */
Bpss.prototype._apiKey = null;

/**
 * Password
 *
 * @type {string}
 * @private
 */
Bpss.prototype._password = null;



/**
 * Get Password
 * @returns {string}
 */
Bpss.prototype.getPassword = function(){
    return this._password;
}

/**
 * Set Password
 * @param password {string}
 */
Bpss.prototype.setPassword = function(password){
    if(typeof password != 'string' || password.trim().length == 0){
        throw "The password must be a string and not empty";
    }
    this._password = password;
}

/**
 * Get Api Key
 * @returns {string}
 */
Bpss.prototype.getApiKey = function(){
    return this._apiKey;
}

/**
 * Set Api Key
 * @param apikey {string}
 */
Bpss.prototype.setApiKey = function(apikey){
    if(typeof apikey != 'string' || apikey.trim().length == 0){
        throw "The api key must be a string and not empty";
    }
    this._apiKey = apikey;
}

/**
 * Send Message
 *
 * @param message {MessageAbstract}
 * @param callback {function}
 */
Bpss.prototype.send = function(message, callback){
    if(!message.validate()){
        throw "The message is not valid";
    }

    var self = this;

    this.connect();



    var authInfo = new Buffer(this._apiKey + ":" + this._password).toString('base64');


    var  options = {



        body :   message.getXmlPayload() ,
        xml : true,
        headers : {  "Authorization" : 'Basic ' + authInfo,
                     "Content-Type"  : 'multipart/related; boundary=mPsbVQo0a68eIL3OAxnm; type=application/xml'
                  },
        encoding : 'UTF-8'

    };


    request.post({ url : Bpss.SERVER_URI , headers : options.headers , body :  options.body } , function(e, r, body){
        self.close();
        if(e){
            console.log(e)
        }
        else if(r.statusCode == 401){
            callback("APIKEY error");
        }else if(body.failure == 1){
            callback("Send error", body.results);
        }else{
//            console.log(body);
        }
    });

}



module.exports = Bpss;


