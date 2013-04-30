var _ = require('underscore');


var PushAbstract = function(){

}

/**
 * Is Connected
 *
 * @type {boolean}
 * @private
 */
PushAbstract.prototype._isConnected = false;

/**
 * Connect to the Push Server
 */
PushAbstract.prototype.connect = function(){
    this._isConnected = true;
}

/**
 * Send Push Message
 *
 * @param message {MessageAbstract}
 * @param callback {function}
 */
PushAbstract.prototype.send = function(message, callback){
    if(!this._isConnected){
        this.connect();
    }
    callback(null, true);
}

/**
 * Close the connection of Push Server
 */
PushAbstract.prototype.close = function(){
    this._isConnected = false;
}

/**
 * Is Conected
 *
 * @returns {boolean}
 */
PushAbstract.prototype.isConnected = function(){
    return this._isConnected;
}

PushAbstract.prototype.setOptions = function(options){
    var self = this;
    _.each(options, function(val, k){
        var method = 'set'+ k.charAt(0).toUpperCase() + k.slice(1);
        if(typeof self['method'] != 'function'){
            throw 'The method "'+method+ '" does not exists.';
        }
        eval('self.'+method+'('+val+');')
    });
}


module.exports = PushAbstract;