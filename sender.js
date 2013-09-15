var PushMessageGcm  = require('./lib/message/gcm'),
    Gcm             = require('./lib/gcm'),
    _               = require('underscore'),
    constants       = require('./lib/const.js');

/**
 * Creating the message
 * Returns the message to send.
 *
 * <ul>
 *  <li>For Android, the parameters depend on what is expected by your applications.</li>
 *  <li>For WindowsPhone, the parameters must be entered as follows:
 * <code>
 * {
 *     title : "title",
 *     msge :"messagee",
 *     data : "Data (Uri)"
 * }
 * </code></li>
 * <li>For IOS, the parameters must be entered like this:
 * <code>
 * {
 *     msge : "alert Message"
 *     data : array(
 *          key1 : mixed value,
 *          ...
 *     )
 * }
 * </code></li>
 * <li>For Blackberry, a single data is required:
 * * <code>
 * {
 *      msge : "Message"
 * }
 * </code></li>
 * </ul>
 *
 * @param   {string}            type            Message Type (android|ios|wp|bb5)
 * @param   {object|string}     params          Message params
 * @return  {MessageAbstract}                   Message Object
 * @private
 */
var _buildMessage = function(type, params){
    var mesg = null;

    switch(type){
        case constants.TYPE_ANDROID :
            mesg = _buildMessageAndroid(params);
            break;
        default :
            throw "Unknow Type";
    }

    return mesg;
};

/**
 * Lets create our preconfigured android messages
 *
 * @param   {string|object}    params           Message Params
 * @returns {PushMessageGcm}                    Message Object
 * @private
 */
var _buildMessageAndroid = function(params){
    var mesg = new PushMessageGcm();
    mesg.setId(new Date().getTime());
    if(typeof params != 'undefined' && params != null){
        mesg.setDatas(params);
    }

    return mesg;
};

/**
 * Function called to send a message on Android device(s)
 *
 * @param {PushMessageGcm}      message             Push Message Object
 * @param {string|Array}        tokens              Push Tokens
 * @param {object}              config              Push Config
 * @param {function}            callback            Callback Function
 * @private
 */
var _sendAndroid = function(message, tokens, config, callback){
    if(typeof config == 'object' && typeof config[constants.CONFIG_APIKEY] != 'undefined'){
        var gcm = new Gcm();
        gcm.setApiKey(config[constants.CONFIG_APIKEY]);

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
};

module.exports.constants = constants;

/**
 * Function called to send a message on device(s).
 *
 * @param {object}              params              Sender params
 * @param {string}              params.type         Sender type
 * @param {object}              params.message      Sender Message
 * @param {Array|string}        params.tokens       Devices tokens
 * @param {object}              params.config       Sender Config
 * @param {function}            callback            Callback Function
 */
module.exports.send = function(params, callback){ //function(type, message, tokens, config, callback){

    var buildMsge = _buildMessage(params.type, params.message);

    switch(params.type){
        case constants.TYPE_ANDROID :
            _sendAndroid(buildMsge, params.tokens, params.config, callback);
            break;
        default :
            throw "Unknow Type";
    }
};