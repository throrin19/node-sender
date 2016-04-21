"use strict";

const request = require('request'),
    util = require("util"),
    chunk = require("./util/array").chunk,
    EventEmitter = require("events"),
    async = require("async"),
    _ = require("underscore"),
    bunyan = require('bunyan');

var Gcm = function (options) {
    EventEmitter.call(this);
    if (options.hasOwnProperty('logger')) {
        this._log = options.log.child({ component : 'gcm-sender' });
    } else {
        this._log = bunyan.createLogger({ name : 'gcm-sender' });
    }
};
util.inherits(Gcm, EventEmitter);

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
 * @param {object} params
 * @param {string} params.apiKey
 * @param {string[]} params.tokenUrl
 * @param {object} params.ttl
 * @param {object} params.message
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
                            let error = {
                                error      : result.error,
                                token      : tokens[index],
                                message_id : result.message_id
                            };
                            if (result.error === Gcm.UNREGISTERED_ERROR) {
                                error.unregistered = true;
                                this.emit("unregistered", error);
                            } else {
                                this.emit("failed", error);
                            }
                            this._log.debug({ error : error }, "Notification fail");
                        } else {
                            this._log.debug({
                                token      : tokens[index],
                                message_id : result.message_id
                            }, "Notification sent");
                            this.emit("successful", {
                                token      : tokens[index],
                                message_id : result.message_id
                            });
                            results.push({
                                token      : tokens[index],
                                message_id : result.message_id
                            });
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
                        this._log.debug({ error : error }, "Notification fail");
                        this.emit("failed", error);
                        results.push(error);
                    });
                }
            }
            callback();
        })
    }, (err) => {
        if (err) {
            throw err;
        }
        let success = [],
            failure = [],
            unregistered = [];
        results.forEach(response => {
            if (response.error) {
                if (response.error.unregistered) {
                    unregistered.push(response);
                } else {
                    failure.push(response);
                }
            } else {
                success.push(response);
            }
        });
        this.emit("end", {
            successful   : success,
            failed       : failure,
            unregistered : unregistered
        });
    });
};

module.exports = Gcm;