var PushMessageGcm  = require('./lib/message/gcm'),
    Gcm             = require('./lib/gcm'),
    _               = require('underscore');


var Sender = function(){

}

Sender.TYPE_ANDROID         = "android";
Sender.TYPE_IOS             = "ios";
Sender.TYPE_WP              = "wp";
Sender.TYPE_BB              = "bb5";

Sender.CONFIG_APIKEY        = "apiKey";
Sender.CONFIG_PUSH          = "serverPush";
Sender.CONFIG_FEEDBACK      = "serverFeedback";
Sender.CONFIG_CERTIF        = "certif";
Sender.CONFIG_PASSWORD      = "password";

Sender.PARAMS_MESSAGE       = "msge";
Sender.PARAMS_MESSAGE_BB    = "msg";
Sender.PARAMS_TITLE         = "title";
Sender.PARAMS_DATA          = "data";

/**
 * Creating the message
 * Returns the message to send.
 *
 * @param type {string}
 * @param params {object|string}
 *
 * <ul>
 *  <li>For Android, the parameters depend on what is expected by the mobile.</li>
 *  <li>For WindowsPhone, the parameters must be entered as follows:
 * <code>
 * {
 *     Sender::PARAMS_TITLE => "title",
 *     Sender::PARAMS_MESSAGE => "messagee",
 *     Sender::PARAMS_DATA => "Data (Uri)"
 * }
 * </code></li>
 * <li>For IOS, the parameters must be entered like this:
 * <code>
 * {
 *     Sender::PARAMS_MESSAGE => "alert Message"
 *     Sender::PARAMS_DATA => array(
 *          "key" => mixed value, ...
 *     )
 * }
 * </code></li>
 * <li>For Blackberry, a single data is required:
 * * <code>
 * {
 *      Sender::PARAMS_MESSAGE => "Message"
 * }
 * </code></li>
 * </ul>
 *
 * @return {MessageAbstract}
 */
Sender.prototype.buildMessage = function(type, params){
    var mesg = null;

    switch(type){
        case Sender.TYPE_ANDROID :
            mesg = this._buildMessageAndroid(params);
            break;
        default :
            throw "Unknow Type";
    }

    return mesg;
}

/**
 * Lets create our preconfigured android messages
 *
 * @param params
 * @returns {PushMessageGcm}
 * @private
 */
Sender.prototype._buildMessageAndroid = function(params){
    var mesg = new PushMessageGcm();
    mesg.setId(new Date().getTime());
    if(typeof params != 'undefined' && params != null){
        mesg.setDatas(params);
    }

    return mesg;
}

/**
 * Function called to send a message on device(s).
 *
 * @param type {string}
 * @param message {MessageAbstract}
 * @param tokens {Array|string}
 * @param config {object}
 * @param callback {function}
 */
Sender.prototype.send = function(type, message, tokens, config, callback){
    switch(type){
        case Sender.TYPE_ANDROID :
            this._sendAndroid(message, tokens, config, callback);
            break;
        default :
            throw "Unknow Type";
    }
}

/**
 * Function called to send a message on Android device(s)
 *
 * @param message {PushMessageGcm}
 * @param tokens {string|Array}
 * @param config {object}
 * @param callback {function}
 * @private
 */
Sender.prototype._sendAndroid = function(message, tokens, config, callback){
    if(typeof config == 'object' && typeof config[Sender.CONFIG_APIKEY] != 'undefined'){
        var gcm = new Gcm();
        gcm.setApiKey(config[Sender.CONFIG_APIKEY]);

        if(typeof tokens == 'array'){
            _.each(tokens, function(token){
                message.addToken(token)
            });
        }else if(typeof tokens == 'string'){
            message.addToken(tokens);
        }

        try{
            gcm.send(message, callback);
        }catch(e){
            callback(e);
        }
    }else{
        callback('invalid config');
    }
}

module.exports = Sender;