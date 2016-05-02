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

module.exports = function () {

    function Sender(options) {
        EventEmitter.call(this);
        if (false === (this instanceof Sender)) {
            return new Sender(options);
        }
    }

    util.inherits(Sender, EventEmitter);

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
    Sender.prototype._sendAndroid = function (params) {
        var gcm = new Gcm({ log : params.log });
        if (!params.message.hasOwnProperty(constants.PARAMS_TITLE)) {
            throw "Error, no title";
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
        return gcm;
    };

    Sender.constants = constants;

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
     * @private
     */
    Sender.prototype._sendWP = function (params) {
        var wns = new Wns({ log : params.log });
        if (!params.config.sid) {
            throw "Error, no SID";
        }
        if (!params.config.secret) {
            throw "Error, no secret";
        }
        var context = {
            ttl               : params.config.ttl,
            tokenUrl          : params.tokens,
            client_id         : params.config.sid,
            client_secret     : params.config.secret,
            notificationClass : "immediate",
            type              : Wns.types.TOAST,
            template          : "ToastText01",
            payload           : {
                text : [
                    params.message[constants.PARAMS_MESSAGE]
                ]
            }
        };
        wns.send(context);
        return wns;
    };

    /**
     * Function called to send a notification on iOS device
     *
     * @param {object}      params              Sender params
     * @param {object}      params.log          Sender log
     * @param {object}      params.message      Sender Message
     * @param {string[]}    params.tokens       Devices tokens
     * @param {object}      params.config       Sender Config
     * @private
     */
    Sender.prototype._sendIOs = function (params) {
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
        apnConnection.pushNotification(notification, myDevices);
        return apnConnection;
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
     * @param {function}            [callback]          Callback function
     */
    Sender.send = function send(params, callback) {
        var sender = new Sender();
        var handled = false;
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
        let senderLib;
        switch (params.type) {
            case constants.TYPE_ANDROID :
                senderLib = sender._sendAndroid(params);
                break;
            case constants.TYPE_WP :
                senderLib = sender._sendWP(params);
                break;
            case constants.TYPE_IOS :
                senderLib = sender._sendIOs(params);
                break;
            default :
                throw "Unknow Type";
        }
        if (_.isFunction(callback)) {
            senderLib.once("error", (err)=> {
                if (!handled) {
                    callback(err);
                    handled = true;
                }
            });
            senderLib.on("end", (result)=> {
                if (!handled) {
                    callback(null, result);
                    handled = true;
                }
            });
        } else {
            senderLib.on("error", sender.emit.bind(sender, "error"));
            senderLib.on("end", sender.emit.bind(sender, "end"));
            senderLib.on("successful", sender.emit.bind(sender, "successful"));
            senderLib.on("failed", sender.emit.bind(sender, "failed"));
            senderLib.on("unregistered", sender.emit.bind(sender, "unregistered"));
        }
        return sender;
    };

    return Sender;
};