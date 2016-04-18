"use strict";

/**
 * From Node APN lib
 * @see {@link https://github.com/argon/node-apn}
 */

const EventEmitter = require("events");
var log;
module.exports = function(dependencies) {

    const Endpoint = dependencies.Endpoint;

    function EndpointManager(config) {
        EventEmitter.call(this);
        log = config.log.child({ component: 'apn-EndpointManager'});
        this._endpoint = null;
        this._config = config;
    }

    EndpointManager.prototype = Object.create(EventEmitter.prototype);

    EndpointManager.prototype.getStream = function getStream() {
        if (this._endpoint && this._endpoint.availableStreamSlots > 0) {
            return this._endpoint.createStream();
        }

        if (!this._currentConnection && !this._endpoint) {
            const endpoint = new Endpoint(this._config);
            this._currentConnection = endpoint;

            endpoint.once("connect", () => {
                this._endpoint = endpoint;
                log.debug("endPoint connected");
                delete this._currentConnection;
            });

            endpoint.on("wakeup", () => {
                if (endpoint.availableStreamSlots > 0) {
                    this.emit("wakeup");
                }
            });

            endpoint.on("error", this.emit.bind(this, "error"));
        }
        return null;
    };

    return EndpointManager;
};