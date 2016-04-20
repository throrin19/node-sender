"use strict";

const EventEmitter = require("events");
const Promise = require("bluebird");
const extend = require("util")._extend;
var log;
module.exports = function(dependencies) {
    const config = dependencies.config;
    const EndpointManager = dependencies.EndpointManager;

    function Connection (options) {
        if(false === (this instanceof Connection)) {
            return new Connection(options);
        }

        log = options.log.child({ component: 'apn-connection'});
        this.config = config(options);
        this.endpointManager = new EndpointManager(this.config);
        this.endpointManager.on("wakeup", () => {
            while (this.queue.length > 0) {
                const stream = this.endpointManager.getStream();
                if (!stream) {
                    return;
                }
                const resolve = this.queue.shift();
                resolve(stream);
            }
        });

        this.endpointManager.on("error", this.emit.bind(this, "error"));

        this.queue = [];

        EventEmitter.call(this);
    }

    Connection.prototype = Object.create(EventEmitter.prototype);

    Connection.prototype.pushNotification = function pushNotification(notification, recipients) {

        const notificationHeaders = notification.headers();
        const notificationBody = notification.compile();

        const send = device => {
            return new Promise( resolve => {
                const stream = this.endpointManager.getStream();
                if (!stream) {
                    this.queue.push(resolve);
                } else {
                    resolve(stream);
                }
            }).then( stream => {
                return new Promise ( resolve => {
                    stream.setEncoding("utf8");

                    stream.headers(extend({
                        ":scheme": "https",
                        ":method": "POST",
                        ":authority": this.config.address,
                        ":path": "/3/device/" + device
                    }, notificationHeaders));
                    
                    var status, responseData = "";
                    stream.on("headers", headers => {
                        status = headers[":status"];
                    });

                    stream.on("data", data => {
                        responseData = responseData + data;
                    });
                    stream.on("end", () => {
                        if (status === "200") {
                            log.info({ device : device.toString() },"Notification sent");
                            resolve({ device });
                            // TODO EMIT
                        } else {
                            const response = JSON.parse(responseData);
                            log.error({ device : device.toString(), status, response },"Notification fail to be send");
                            resolve({ device : device.toString(), status, response });
                            // TODO EMIT
                        }
                    });
                    stream.on("error", this.emit.bind(this, "error"));

                    stream.write(notificationBody);
                    stream.end();
                });
            });
        };

        if (!Array.isArray(recipients)) {
            recipients = [recipients];
        }

        return Promise.all( recipients.map(send) ).then( responses => {
            let success = [];
            let failure = [];
            responses.forEach( response => {
                if (response.status) {
                    failure.push(response);
                } else {
                    success.push(response);
                }
            });
            return [success, failure];
        });
    };

    return Connection;
};

