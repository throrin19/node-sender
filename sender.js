'use strict';

var PushMessageGcm = require('./lib/message/gcm'),
    Gcm = require('./lib/gcm'),
    _ = require('underscore'),
    constants = require('./lib/const.js'),
    Wns = require("./lib/wns"),
    Apn = require("./lib/apn"),
    bunyan = require('bunyan'),
    Serializer = require("./lib/util/serializer");

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
 * Function called to send a notification on Android device(s)
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

    if (!config.hasOwnProperty("ttl") || (config.ttl < 0 && config.ttl > 2419200)) {
        config.ttl = 3600;
    }
    message.setTtl(config.ttl);
    try {
        gcm.send(message, callback);
    } catch (e) {
        callback(e);
    }
    gcm.on("error", (err) => {
        // TODO
    });
    gcm.on("transmitted", (message) => {
        // TODO
    });
};

/**
 * Function called to send a notification on WindowsPhone device
 *
 * @param {object}      params                  Sender params
 * @param {object}      params.log              Sender log
 * @param {object}      params.message          Sender Message
 * @param {string[]}    params.tokens           Devices tokens
 * @param {object}      params.config           Sender Config
 * @param {string}      params.tokens.sid       Package Security Identifier (SID)
 * @param {string}      params.tokens.secret    Secret password
 * @param {function}    callback                Callback Function
 * @private
 */
var _sendWP = function (params, callback) {
    var wns = new Wns({log : params.log});
    if (!params.tokens.hasOwnProperty("url")) {
        throw "Error, no endpoint url";
    }
    if (!params.tokens.hasOwnProperty("sid")) {
        throw "Error, no SID";
    }
    if (!params.tokens.hasOwnProperty("secret")) {
        throw "Error, no secret";
    }
    if (!params.message.hasOwnProperty(constants.PARAMS_MESSAGE)) {
        throw "Error, no message";
    }
    var context = {
        log           : params.log,
        ttl           : (params.config && params.config.expiry) ? params.config.expiry : 3600,
        tokenUrl      : params.tokens.url,
        client_id     : params.tokens.sid,
        client_secret : params.tokens.secret,
        type          : Wns.types.TOAST,
        template      : "ToastText01",
        payload       : {
            text  : [
                params.message[constants.PARAMS_MESSAGE]
            ],
            image : []
        }
    };
    wns.send(context, function (err, result) {
        callback(err, result);
    });
    wns.on("error", (err) => {
        // TODO
    });
    wns.on("transmitted", (message) => {
        // TODO
    });
};

/**
 * Function called to send a notification on iOS device
 *
 * @param {object}      params              Sender params
 * @param {object}      params.log          Sender log
 * @param {object}      params.message      Sender Message
 * @param {string[]}    params.tokens       Devices tokens
 * @param {object}      params.config       Sender Config
 * @param {function}    callback            Callback Function
 * @private
 */
var _sendIOs = function (params, callback) {
    params.config.log = params.log;
    var notification = new Apn.Notification();
    var apnConnection = new Apn.Connection(params.config);
    notification.expiry = Math.floor(Date.now() / 1000) + (params.config.ttl ? params.config.ttl : 3600);
    notification.badge = params.message.badge;
    notification.sound = params.message.sound;
    notification.alert = params.message.alert;
    var myDevices = [];
    _.each(params.tokens, (token) => {
        myDevices.push(new Apn.Device(token))
    });
    apnConnection.pushNotification(notification, myDevices).then((err, res) => {
        callback(err, res);
    });
    apnConnection.on("error", (err) => {
        // TODO
    });
    apnConnection.on("transmitted", (message) => {
        // TODO
    });
};

module.exports.constants = constants;

/**
 * Function called to send a notification on device(s).
 *
 * @param {object}              params              Sender params
 * @param {object}              params.log          Sender log
 * @param {string}              params.type         Sender type
 * @param {object}              params.message      Sender Message
 * @param {object|string[]}     params.tokens       Devices tokens
 * @param {object}              params.config       Sender Config
 * @param {function}            callback            Callback Function
 */
module.exports.send = function (params, callback) {
    if (!params.hasOwnProperty("log")) {
        params.log = {
            fatal: () => {},
            error: () => {},
            warn : () => {},
            info : () => {},
            debug: () => {},
            trace: () => {},
            child: function() { return this; }
        };
    } else {
        params.log.addSerializers({frame: Serializer.frameSerializer});
        params.log.addSerializers({stream: Serializer.streamSerializer});
        params.log.addSerializers({params: Serializer.paramsSerializer});
    }
    switch (params.type) {
        case constants.TYPE_ANDROID :
            _sendAndroid(_buildMessageAndroid(params.message), params.tokens, params.config, callback);
            break;
        case constants.TYPE_WP :
            _sendWP(params, callback);
            break;
        case constants.TYPE_IOS :
            _sendIOs(params, callback);
            break;
        default :
            throw "Unknow Type";
    }
};