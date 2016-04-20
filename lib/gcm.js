"use strict";

var request = require('request'),
    util = require("util"),
    EventEmitter = require("events"),
    async = require("async"),
    _ = require("underscore"),
    bunyan = require('bunyan');

var Gcm = function (options) {
    EventEmitter.call(this);
    if (options.hasOwnProperty('log')) {
        this._log = options.log.child({ component : 'gcm-sender' });
    } else {
        this._log = bunyan.createLogger({ name : 'gcm-sender' });
    }
};
util.inherits(Gcm, EventEmitter);

Gcm.generateJsonBody = function (params) {

};

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
 * @param {object} params.tokenUrl
 * @param {object} params.ttl
 * @param {object} params.message
 */
Gcm.prototype.send = function (params) {
    this._log.trace({ params : params }, "Send()'s params");
    for (var i = 0; i < params.tokenUrl.length; i += 1000) {
        let req = {
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
                registration_ids : [],
                collapse_key     : params.apiKey,
                data             : params.message,
                time_to_live     : params.ttl
            }
        };
        req.body.registration_ids.push(_.initial(_.rest(params.tokenUrl, i), 1000)); // Cut the token array.)
        this._log.trace({ req : req }, "Send()'s request");
        request.post(req, (err, res)=> {
            this._log.trace({ res : res });
        })
    }
};

module.exports = Gcm;