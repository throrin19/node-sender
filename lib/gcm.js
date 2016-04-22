"use strict";

const request = require('request'),
    util = require("util"),
    chunk = require("./util/array").chunk,
    EventEmitter = require("events"),
    async = require("async"),
    _ = require("underscore"),
    bunyan = require('bunyan');

/**
 * GCM lib to send notification to WindowsPhone devices.
 * 
 * @param {object} options.log Bunyan logger
 * @constructor
 */
var Gcm = function (options) {
    EventEmitter.call(this);
    this._log = options.log.child({ component : 'gcm-sender' });
};
util.inherits(Gcm, EventEmitter);

/**
 * Android unregistered error code.
 *
 * @type {string}
 * @const
 */
Gcm.UNREGISTERED_ERROR = "NotRegistered";

/**
 * Android GCM Server URI
 * @type {string}
 * @const
 */
Gcm.SERVER_URI = 'https://android.googleapis.com/gcm/send';

/**
 * Send Message
 *
 * @param {object}          params              Function's parameters.
 * @param {string}          params.apiKey       GCM Apikey.
 * @param {string[]}        params.tokenUrl     Tokens.
 * @param {object}          params.ttl          Time to live.
 * @param {object}          params.message      Notification message.
 */
Gcm.prototype.send = function (params) {
    this._log.trace({ params : params }, "Send()'s params");
    var registration_ids = chunk(params.tokenUrl, 1000); // Cut the token array in chunk.
    var results = [];
    var req = {
        uri       : Gcm.SERVER_URI,
        json      : true,
        method    : "POST",
        headers   : {
            'Authorization' : 'key=' + params.apiKey,
            'Content-Type'  : 'application/json'
        },
        encoding  : 'UTF-8',
        strictSSL : false,
        body      : {
            delay_while_idle : false,
            collapse_key     : params.apiKey,
            data             : params.message,
            time_to_live     : params.ttl
        }
    };
    async.each(registration_ids, (tokens, callback) => {
        req.body.registration_ids = tokens;
        this._log.debug({ req : req }, "Send()'s request");
        request.post(req, (err, res)=> {
            this._log.trace({ res : res });
            if (err) {
                this._log.error({ err : err }, "Error while sending the notification request");
                _.each(tokens, (token)=> {
                    let error = {
                        error      : true,
                        token      : token,
                        statusCode : jsonResponse.statusCode,
                        body       : jsonResponse.body
                    };
                    this._log.debug({ error : error }, "Notification fail");
                    this.emit("failed", error);
                    results.push(error);
                });
            } else {
                var jsonResponse = res.toJSON();
                this._log.debug({ res : jsonResponse }, "Notification GCM response");
                if (jsonResponse.statusCode === 200) {
                    _.each(jsonResponse.body.results, (result, index)=> {
                        if (result.error) {
                            let info = {
                                error      : result.error,
                                token      : tokens[index],
                                message_id : result.message_id
                            };
                            if (result.error === Gcm.UNREGISTERED_ERROR) {
                                info.unregistered = true;
                                this.emit("unregistered", info);
                            } else {
                                this.emit("failed", info);
                            }
                            this._log.debug({ error : info }, "Notification fail");
                            results.push(info);
                        } else {
                            let info = {
                                token      : tokens[index],
                                message_id : result.message_id
                            };
                            this._log.debug(info, "Notification sent");
                            this.emit("successful", info);
                            results.push(info);
                        }
                    })
                } else {
                    _.each(tokens, (token)=> {
                        let error = {
                            error      : true,
                            token      : token,
                            statusCode : jsonResponse.statusCode,
                            body       : jsonResponse.body
                        };
                        this._log.debug(error, "Notification fail");
                        this.emit("failed", error);
                        results.push(error);
                    });
                }
            }
            callback();
        })
    }, (err) => {
        if (err) {
            this.emit("error", err);
        }
        let data = {
            success      : [],
            failure      : [],
            unregistered : []
        };
        results.forEach(response => {
            if (response.unregistered) {
                data.unregistered.push(response);
            } else if (response.error) {
                data.failure.push(response);
            } else {
                data.success.push(response);
            }
        });
        this.emit("end", data);
    });
};

module.exports = Gcm;