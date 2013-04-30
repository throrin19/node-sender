var _ = require('underscore');

var MessageAbstract = function(){

}

MessageAbstract.prototype._tokens   = null;
MessageAbstract.prototype._id       = null;

/**
 * Get Token
 *
 * @return {string}
 */
MessageAbstract.prototype.getToken = function()
{
    return this._tokens;
}

/**
 * Set Token
 *
 * @param  {string} token
 */
MessageAbstract.prototype.setToken = function(token)
{
    if (typeof token != 'string') {
        throw 'token must be a string';
    }
    this._tokens = token;
}

/**
 * Get Message ID
 *
 * @return scalar
 */
MessageAbstract.prototype.getId = function()
{
    return this._id;
}

/**
 * Set Message ID
 *
 * @param id
 */
MessageAbstract.prototype.setId = function(id)
{
    if (!(/boolean|number|string/).test(typeof id)) {
        throw 'id must be a scalar';
    }
    this._id = id;
}

/**
 * Set Options
 *
 * @param {Array} opt
 */
MessageAbstract.prototype.setOptions = function(opt)
{
    var self = this;
    _.each(opt, function(val, k){
        var method = 'set'+ k.charAt(0).toUpperCase() + k.slice(1);
        if(typeof self['method'] != 'function'){
            throw 'The method "'+method+ '" does not exists.';
        }
        eval('self.'+method+'('+val+');')
    });
}


/**
 * Validate Message format
 *
 * @return boolean
 */
MessageAbstract.prototype.validate = function()
{
    return true;
}

module.exports = MessageAbstract;