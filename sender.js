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
     * @param {function}    [callback]          Callback function
     * @private
     */
    Sender.prototype._sendAndroid = function (params, callback) {
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
        try {
            gcm.send(context, callback);
        } catch (err) {
            callback(err, null);
        }
        gcm.on("end", this.emit.bind(this, "end"));
        gcm.on("successful", this.emit.bind(this, "successful"));
        gcm.on("failed", this.emit.bind(this, "failed"));
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
     * @param {function}    [callback]              Callback function
     * @private
     */
    Sender.prototype._sendWP = function (params, callback) {
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
        try {
            wns.send(context, callback);
        } catch (err) {
            callback(err, null);
        }
        wns.on("end", this.emit.bind(this, "end"));
        wns.on("successful", this.emit.bind(this, "successful"));
        wns.on("failed", this.emit.bind(this, "failed"));
    };

    /**
     * Function called to send a notification on iOS device
     *
     * @param {object}      params              Sender params
     * @param {object}      params.log          Sender log
     * @param {object}      params.message      Sender Message
     * @param {string[]}    params.tokens       Devices tokens
     * @param {object}      params.config       Sender Config
     * @param {function}    [callback]          Callback function
     * @private
     */
    Sender.prototype._sendIOs = function (params, callback) {
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
        apnConnection.pushNotification(notification, myDevices).then((data)=> {
            callback(null, data);
        });
        apnConnection.on("end", this.emit.bind(this, "end"));
        apnConnection.on("successful", this.emit.bind(this, "successful"));
        apnConnection.on("failed", this.emit.bind(this, "failed"));
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
        if (!params.tokens || params.tokens.length <= 0) {
            throw "Error, no endpoint url";
        }
        if (!params.config) {
            throw "Error, no config found";
        }
        if (!params.message) {
            throw "Error, no message";
        }
        if (!_.isFunction(callback)) {
            callback = () => {
            }
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
        switch (params.type) {
            case constants.TYPE_ANDROID :
                sender._sendAndroid(params, callback);
                break;
            case constants.TYPE_WP :
                sender._sendWP(params, callback);
                break;
            case constants.TYPE_IOS :
                sender._sendIOs(params, callback);
                break;
            default :
                throw "Unknow Type";
        }
        return sender;
    };

    return Sender;
};