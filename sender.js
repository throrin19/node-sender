'use strict';

var PushMessageGcm = require('./lib/message/gcm'),
    Gcm = require('./lib/gcm'),
    PushMessageBpss = require('./lib/message/bpss'),
    Bpss = require('./lib/bpss'),
//PushMessageMpns = require('./lib/message/mpns.js'),
//Mpns = require('./lib/mpns'),
    _ = require('underscore'),
    constants = require('./lib/const.js'),
    ToastMessage = require("./lib/message/mpns/toast"),
    Wns = require("./lib/wns"),
    Device = require("./lib/device"),
    Connection = require("./lib/connection"),
    Notification = require("./lib/notification"),
    bunyan = require('bunyan');

var log = bunyan.createLogger({
    name  : "node-sender",
    level : "debug",
    src   : true
});

/**
 * Creating the message
 * Returns the message to send.
 *
 * <ul>
 *  <li>For Android, the parameters depend on what is expected by your applications.</li>
 *  <li>For WindowsPhone, the parameters must be entered as follows:
 * <code>
 * {
 *     msge :"messagee",
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
var _buildMessage = function (type, params) {
    var mesg = null;

    switch (type) {
        case constants.TYPE_ANDROID :
            mesg = _buildMessageAndroid(params);
            break;

        case constants.TYPE_BB :
            mesg = _buildMessageBlackBerry(params);
            break;

        case constants.TYPE_WP :
            mesg = _buildMessageWindowsPhone(params);
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
var _buildMessageAndroid = function (params) {
    var mesg = new PushMessageGcm();
    mesg.setId(new Date().getTime());
    if (typeof params != 'undefined' && params != null) {
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
var _sendAndroid = function (message, tokens, config, callback) {
//    if(typeof config == 'object' && typeof config[constants.CONFIG_APIKEY] != 'undefined'){
    var gcm = new Gcm();
//        gcm.setApiKey(config[constants.CONFIG_APIKEY]);

    message.clearTokens();
    if (typeof tokens == 'object') {
        _.each(tokens, function (token) {
            var apikey = token.split("@!!@")[1];
            var item_token = token.split("@!!@")[0];

            if (typeof apikey != "undefined") {
                gcm.setApiKey(apikey);
            }

            message.addToken(item_token);
        });
    } else if (typeof tokens == 'string') {

        var apikey = tokens.split("@!!@")[1];
        var item_token = tokens.split("@!!@")[0];
        message.addToken(item_token);

        if (typeof apikey != "undefined") {
            gcm.setApiKey(apikey);
        }
    }

    try {
        gcm.send(message, callback);
    } catch (e) {
        callback(e);
    }
};

/**
 * Lets create our preconfigured BlackBerry messages
 *
 * @param   {string|object}    params           Message Params
 * @returns {PushMessageGcm}                    Message Object
 * @private
 * @Deprecated
 */
var _buildMessageBlackBerry = function (params) {
    var mesg = new PushMessageBpss();
    mesg.setId(new Date().getTime());
    if (typeof params != 'undefined' && params != null) {
        mesg.setData(params);
    }

    return mesg;
};

/**
 * Function called to send a message on BlackBerry device(s)
 *
 * @param {PushMessageBpss}      message             Push Message Object
 * @param {string|Array}        tokens              Push Tokens
 * @param {object}              config              Push Config
 * @param {function}            callback            Callback Function
 * @private
 * @Deprecated
 */
var _sendBlackBerry = function (message, tokens, config, callback) {
//    var result = null;
//    if (
//        config != null &&
//        config.hasOwnProperty(constants.CONFIG_PASSWORD) &&
//        config.hasOwnProperty(constants.CONFIG_APIKEY)
//
//    ) {
//        message.setAppId(config[constants.CONFIG_APIKEY]);
//        bpss = new Bpss();
//        bpss.setApiKey(config[constants.CONFIG_APIKEY]);
//        bpss.setPassword(config[constants.CONFIG_PASSWORD]);
//
//        message.clearTokens();
//
//        if (!_.isArray(tokens)) {
//            tokens = new Array(tokens);
//        }
//
//        _.each(tokens, function (token) {
//            message.addToken(token);
//        });
//
////        message.setTokens( tokens );
//
//        try {
//            result = bpss.send(message, callback);
//        } catch (e) {
//            callback(e);
//        }
//
//        return result;
//    } else {
//        throw "Les champs de configuration requis pour Blackberry n'ont pas tous été saisis";
//    }
};

/**
 * Lets create our preconfigured BlackBerry messages
 *
 * @param   {string|object}    params           Message Params
 * @returns {PushMessageGcm}                    Message Object
 * @private
 * @Deprecated
 */
var _buildMessageWindowsPhone = function (params) {

    //var mesg = new ToastMessage();
    //
    //if (params.hasOwnProperty(constants.PARAMS_TITLE) || params.message.hasOwnProperty(constants.PARAMS_MESSAGE)) {
    //
    //    if (params.hasOwnProperty(constants.PARAMS_TITLE)) {
    //        mesg.setTitle(params[constants.PARAMS_TITLE]);
    //
    //    }
    //    if (params.message.hasOwnProperty(constants.PARAMS_MESSAGE)) {
    //
    //        mesg.setMessage(params.message[constants.PARAMS_MESSAGE]);
    //    }
    //}
    //else {
    //    throw "Les paramètres title et msge n'ont pas été saisis";
    //}
    //
    //if (params.hasOwnProperty(constants.PARAMS_DATA)) {
    //    if (params[constants.PARAMS_DATA].length <= 250) {
    //        mesg.setParams(params[constants.PARAMS_DATA]);
    //    }
    //    else {
    //        throw "data dépasse 250 caractères";
    //    }
    //}
    //
    //return mesg;

};

/**
 * Function called to send a message on BlackBerry device(s)
 *
 * @param {PushMessageBpss}     message             Push Message Object
 * @param {string|Array}        tokens              Push Tokens
 * @param {function}            callback            Callback Function
 * @private
 * @Deprecated
 */
var _sendWP7Toast = function (message, tokens, callback) {

    //var mpns = new Mpns();
    //
    //if (!_.isArray(tokens)) {
    //    tokens = new Array(tokens);
    //}
    //_.each(tokens, function (elem_token) {
    //    message.setTokenMpns(elem_token);
    //
    //    try {
    //        mpns.send(message, callback);
    //    } catch (e) {
    //        callback(e);
    //    }
    //
    //});
};

/**
 * Function called to send a message on WindowsPhone device
 *
 * @param {object} message
 * @param {object} tokens
 * @param {string[]} tokens.url
 * @param {string} tokens.sid
 * @param {string} tokens.secret
 * @param {function} callback
 * @private
 */
var _sendWP = function (message, tokens, callback) {
    var wns = new Wns(log);
    if (!tokens.hasOwnProperty("url")) {
        throw "Error, no endpoint url";
    }
    if (!tokens.hasOwnProperty("sid")) {
        throw "Error, no SID";
    }
    if (!tokens.hasOwnProperty("secret")) {
        throw "Error, no secret";
    }
    if (!message.hasOwnProperty(constants.PARAMS_MESSAGE)) {
        throw "Error, no message";
    }
    var context = {
        tokenUrl      : tokens.url,
        client_id     : tokens.sid,
        client_secret : tokens.secret,
        type          : Wns.types.TOAST,
        template      : "ToastText01",
        payload       : {
            text  : [
                message[constants.PARAMS_MESSAGE]
            ],
            image : []
        }
    };
    wns.send(context, function (err, result) {
        callback(err, result);
    });
    wns.on("transmitted", function (message) {
        // lol
    });
    wns.on("error", function (error) {
        // lol
    });
};

/**
 * Function called to send a message on iOS device
 *
 * @param {object} message
 * @param {string[]} tokens
 * @param {object} config
 * @param {function} callback
 * @private
 */
var _sendIOs = function (message, tokens, config, callback) {
    var notification = new Notification();
    var apnConnection = new Connection(config);
    notification.expiry = message.expiry;
    notification.badge = message.badge;
    notification.sound = message.sound;
    notification.alert = message.alert;
    _.each(tokens, function (token) {
        var myDevice = new Device(token);
        apnConnection.pushNotification(notification, myDevice).then(callback);
    })
};

module.exports.constants = constants;

/**
 * Function called to send a message on device(s).
 *
 * @param {object}              params              Sender params
 * @param {string}              params.type         Sender type
 * @param {object}              params.message      Sender Message
 * @param {object|string[]}     params.tokens       Devices tokens
 * @param {object}              params.config       Sender Config
 * @param {function}            callback            Callback Function
 */
module.exports.send = function (params, callback) { //function(type, message, tokens, config, callback){
    switch (params.type) {
        case constants.TYPE_ANDROID :
            var buildMsge = _buildMessage(params.type, params.message);
            _sendAndroid(buildMsge, params.tokens, params.config, callback);
            break;
        case constants.TYPE_BB :
            var buildMsge = _buildMessage(params.type, params.message);
            _sendBlackBerry(buildMsge, params.tokens, params.config, callback);
            break;
        case constants.TYPE_WP :
            _sendWP(params.message, params.tokens, callback);
            break;
        case constants.TYPE_IOS :
            _sendIOs(params.message, params.tokens, params.config, callback);
            break;
        default :
            throw "Unknow Type";
    }
};