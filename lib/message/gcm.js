var _               = require('underscore');
    MessageAbstract = require('./message_abstract');

var Gcm = function(){

}

Gcm.prototype = new MessageAbstract();

/**
 * Tokens
 *
 * @var {Array}
 * @private
 */
Gcm.prototype._tokens = new Array();

/**
 * Data key value pairs
 *
 * @var {Array}
 * @private
 */
Gcm.prototype._datas = {};

/**
 * Delay while idle
 *
 * @var {Boolean}
 * @private
 */
Gcm.prototype._delay = false;

/**
 * Time to live in seconds
 *
 * @var {Number}
 * @private
 */
Gcm.prototype._ttl = 0;

/**
 * Add Token
 *
 * @param token {String}
 */
Gcm.prototype.addToken = function(token){
    if (typeof token != 'string') {
        throw 'token must be a string';
    }

    var findToken = _.find(this._tokens, function(tck){
        return tck == token;
    });

    if(typeof findToken == 'undefined'){
        this._tokens.push(token);
    }
}

/**
 * Set tokens
 *
 * @param token {String|Array}
 */
Gcm.prototype.setTokens = function(token){
    var self = this;
    this.clearTokens();
    if(typeof token == 'String'){
        this._tokens.push(token);
    }else
    if(typeof token == 'array'){
        _.each(token, function(tck){
            self.addToken(tck);
        });
    }
}

/**
 * Clear tokens
 */
Gcm.prototype.clearTokens = function(){
    this._tokens = new Array();
}

/**
 * Add data
 *
 * @param key {String}
 * @param value {String|Boolean|Number}
 */
Gcm.prototype.addData = function(key, value){
    if(typeof key != 'string'){
        throw 'key must be string.';
    }
    if (!(/boolean|number|string/).test(typeof value)) {
        throw 'value must be scalar';
    }

    this._datas[key] = value;
}

/**
 * Set datas
 *
 * @param data {Array}
 */
Gcm.prototype.setDatas = function(data){
    var self = this;
    this.clearDatas();
    _.each(data, function(value, key){
        self.addData(key, value);
    });
}

/**
 * clear datas
 */
Gcm.prototype.clearDatas = function(){
    this._datas = {};
}

/**
 * getDatas
 *
 * @returns {Array}
 */
Gcm.prototype.getDatas = function(){
    return this._datas;
}

/**
 * Set Delay While Idle
 *
 * @param delay {Boolean}
 */
Gcm.prototype.setDelayWhileIdle = function(delay){

    if(typeof delay != 'boolean'){
        throw 'delay must be boolean'
    }
    this._delay = delay;
}

/**
 * return Delay
 *
 * @returns {boolean}
 */
Gcm.prototype.getDelayWhileIdle = function(){
    return this._delay;
}

/**
 * Set time to live
 * If secs is set to 0 it will be handled as
 * not being set.
 *
 * @param secs {number}
 */
Gcm.prototype.setTtl = function(secs){
    if(typeof secs != 'number'){
        throw 'secs must be number';
    }

    this._ttl = secs;
}

/**
 * get Ttl
 *
 * @returns {number}
 */
Gcm.prototype.getTtl = function(){
    return this._ttl;
}

/**
 * Validate this is a proper Gcm message
 * Does not validate size.
 *
 * @returns {boolean}
 */
Gcm.prototype.validate = function(){
    if(typeof this._tokens != 'object' || this._tokens.length == 0){
        return false;
    }
    if(this._ttl > 0 && (!(/boolean|number|string/).test(typeof this._id) || this._id.length == 0)){
        return false;
    }
    return true;
}

/**
 * To Json utility method
 * Takes the data and properly assigns it to
 * a json encoded array to match the Gcm format.
 *
 * @returns {Object}
 */
Gcm.prototype.toJson = function(){
    var json = {};
    if(this._tokens){
        json.registration_ids = this._tokens;
    }
    if(this._id){
        json.collapse_key = this._id+"";
    }
    if(this._datas){
        json.data = this._datas;
    }
    if(this._delay){
        json.delay_while_idle = this._delay;
    }
    if(this._ttl){
        json.time_to_live = this._ttl;
    }

    return json;
}

module.exports = Gcm;