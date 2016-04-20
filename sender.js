'use strict';

const Gcm = require('./lib/gcm'),
    _ = require('underscore'),
    constants = require('./lib/const.js'),
    Wns = require("./lib/wns"),
    Apn = require("./lib/apn"),
    bunyan = require('bunyan'),
    util = require("util"),
    Serializer = require("./lib/util/serializer"),
    EventEmitter = require("events");

/**
 * Function called to send a notification on Android device(s)
 *
 * @param {object}      params                  Sender params
 * @param {object}      params.log              Sender log
 * @param {object}      params.message          Sender Message
 * @param {string[]}    params.tokens           Devices tokens
 * @param {object}      params.config           Sender Config
 * @param {string}      params.config.apiKey    Sender GCM apiKey
 * @private
 */
var _sendAndroid = function (params) {
    //EventEmitter.call(this);
    var gcm = new Gcm({ log : params.log });
    if (!params.message.hasOwnProperty(constants.PARAMS_MESSAGE)) {
        throw "Error, no message";
    }
    if (!params.config.hasOwnProperty("apiKey")) {
        throw "Error, no apiKey";
    }
    var context = {
        ttl      : params.config.ttl,
        message  : params.message,
        tokenUrl : params.tokens,
        apiKey   : params.config.apiKey
    };
    gcm.send(context);
    //gcm.emit(this.emit.bind(this));
};

/**
 * Function called to send a notification on WindowsPhone device
 *
 * @param {object}      params                  Sender params
 * @param {object}      params.log              Sender log
 * @param {object}      params.message          Sender Message
 * @param {string[]}    params.tokens           Devices tokens
 * @param {object}      params.config           Sender Config
 * @param {string}      params.config.sid       Package Security Identifier (SID)
 * @param {string}      params.config.secret    Secret password
 * @param {function}    callback                Callback Function
 * @private
 */
var _sendWP = function (params, callback) {
    EventEmitter.call(this);
    var wns = new Wns({ log : params.log });
    if (!params.config.hasOwnProperty("sid") || params.config.sid) {
        throw "Error, no SID";
    }
    if (!params.config.hasOwnProperty("secret")) {
        throw "Error, no secret";
    }
    var context = {
        ttl           : params.config.ttl,
        tokenUrl      : params.config.url,
        client_id     : params.config.sid,
        client_secret : params.tokens.secret,
        type          : Wns.types.TOAST,
        template      : "ToastText01",
        payload       : {
            text : [
                params.message[constants.PARAMS_MESSAGE]
            ]
        }
    };
    wns.send(context, function (err, result) {
        callback(err, result);
    });
    wns.emit(this.emit.bind(this));
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
    //EventEmitter.call(this);
    params.config.log = params.log;
    var notification = new Apn.Notification();
    var apnConnection = new Apn.Connection(params.config);
    notification.expiry = Math.floor(Date.now() / 1000) + params.config.ttl;
    notification.badge = params.message.badge;
    notification.sound = params.message.sound;
    notification.alert = params.message.alert;
    var myDevices = [];
    _.each(params.tokens, (token) => {
        myDevices.push(new Apn.Device(token))
    });
    //apnConnection.pushNotification(notification, myDevices).then((err, res) => {
    //    callback(err, res);
    //});
    //apnConnection.emit(this.emit.bind(this));
};

module.exports.constants = constants;

/**
 * Function called to send a notification on device(s).
 *
 * @param {object}              params              Sender params
 * @param {object}              [params.log]        Sender log
 * @param {string}              params.type         Sender type
 * @param {object}              params.message      Sender Message
 * @param {string[]}            params.tokens       Devices tokens
 * @param {object}              params.config       Sender Config
 * @param {function}            callback            Callback Function
 */
var send = function (params, callback) {
    EventEmitter.call(this);
    if (!params.tokens || params.tokens.length <= 0) {
        throw "Error, no endpoint url";
    }
    if (!params.config) {
        throw "Error, no config found";
    }
    if (!params.message) {
        throw "Error, no message";
    }
    if (!params.hasOwnProperty("log")) {
        params.log = {
            fatal : () => {
            },
            error : () => {
            },
            warn  : () => {
            },
            info  : () => {
            },
            debug : () => {
            },
            trace : () => {
            },
            child : function () {
                return this;
            }
        };
    } else {
        params.log.addSerializers({ frame : Serializer.frameSerializer });
        params.log.addSerializers({ stream : Serializer.streamSerializer });
        params.log.addSerializers({ params : Serializer.paramsSerializer });
    }
    if (isNaN(params.config.ttl) || params.config.ttl < 0 || params.config.ttl > 2419200) {
        params.config.ttl = 3600;
    }
    var sender;
    switch (params.type) {
        case constants.TYPE_ANDROID :
            sender = _sendAndroid(params);
            break;
        case constants.TYPE_WP :
            sender = _sendWP(params, callback);
            break;
        case constants.TYPE_IOS :
            sender = _sendIOs(params, callback);
            break;
        default :
            throw "Unknow Type";
    }
  
    //sender.emit(this.emit.bind(this));
};

util.inherits(send, EventEmitter);
util.inherits(_sendAndroid, EventEmitter);
util.inherits(_sendIOs, EventEmitter);
util.inherits(_sendWP, EventEmitter);

module.exports = {
    send,
    constants
};