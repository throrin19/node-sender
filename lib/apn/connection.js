"use strict";

const EventEmitter = require("events");
const Promise = require("bluebird");
const extend = require("util")._extend;
module.exports = function(dependencies) {
    const config = dependencies.config;
    const EndpointManager = dependencies.EndpointManager;

    function Connection (options) {
        if(false === (this instanceof Connection)) {
            return new Connection(options);
        }

        this._log = options.log.child({ component : 'apn-sender' });
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

                    var status, id, responseData = "";
                    stream.on("headers", headers => {
                        status = headers[":status"];
                        id = headers["apns-id"];
                    });

                    stream.on("data", data => {
                        responseData = responseData + data;
                    });
                    stream.on("end", () => {
                        if (status === "200") {
                            let info = {
                                device     : device.toString(),
                                message_id : id
                            };
                            this._log.debug(info, "Notification sent");
                            this.emit("successful", info);
                            resolve(info);
                        } else {
                            const response = JSON.parse(responseData);
                            let error = {
                                device : device.toString(),
                                status,
                                response
                            };
                            if (status === "410") {
                                error.unregistered = true;
                                this.emit("unregistered", { device : device.toString() });
                            } else {
                                this.emit("failed", {
                                    device : device.toString(),
                                    status,
                                    response
                                });
                            }
                            this._log.debug(error, "Notification fail to be send");
                            resolve(error);
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
        return Promise.all(recipients.map(send)).then(responses => {
            let success = [],
                failure = [],
                unregistered = [];
            responses.forEach(response => {
                if (response.status) {
                    if (response.unregistered) {
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
            return [success, failure, unregistered];
        });
    };

    return Connection;
};

