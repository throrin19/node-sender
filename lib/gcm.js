var PushAbstract    = require('./push_abstract'),
    request         = require('request');

var Gcm = function(){

}

Gcm.prototype = new PushAbstract();

/**
 * Android GCM Server URI
 * @type {string}
 * @const
 */
Gcm.SERVER_URI = 'https://android.googleapis.com/gcm/send';

/**
 * HttpClient
 *
 * @type {null}
 * @private
 */
Gcm.prototype._httpClient = null;

/**
 * API Key
 *
 * @type {string}
 * @private
 */
Gcm.prototype._apiKey = null;

/**
 * Get Api Key
 * @returns {string}
 */
Gcm.prototype.getApiKey = function(){
    return this._apiKey;
}

/**
 * Set Api Key
 * @param apikey {string}
 */
Gcm.prototype.setApiKey = function(apikey){
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
Gcm.prototype.send = function(message, callback){
    if(!message.validate()){
        throw "The message is not valid";
    }

    var self = this;

    this.connect();

    request.post(Gcm.SERVER_URI, {
        body : message.toJson(),
        json: true,
        headers : {
            'Authorization' : 'key='+this.getApiKey(),
            'Content-Type' : 'application/json'
        },
        encoding : 'UTF-8',
        strictSSL : false
    }, function(e, r, body){
        self.close();
        callback(e, body);
    });
}

module.exports = Gcm;