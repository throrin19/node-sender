/**
 *
 * @param {String} responseString : JSON encoded Message
 * @param {Message/Gcm} message
 * @constructor
 */
var Gcm = function(responseString, message){

    if(typeof responseString != 'undefined' && responseString != null){
        var response = JSON.parse(responseString);
        if(response == null){
            throw "The server gave us an invalid response, try again later";
        }
        this.setResponse(response);
    }

    if(typeof message != 'undefined' && message != null){
        this.setMessage(message);
    }
}

Gcm.RESULT_MESSAGE_ID = 'message_id';
Gcm.RESULT_ERROR      = 'error';
Gcm.RESULT_CANONICAL  = 'registration_id';

// protected vars declaration
Gcm.prototype._id            = null,
Gcm.prototype._successCnt    = null,
Gcm.prototype._failureCnt    = null,
Gcm.prototype._canonicalCnt  = null,
Gcm.prototype._message       = null,
Gcm.prototype._results       = null,
Gcm.prototype._response      = null;

// private functions

/**
 * Correlate Message and Result
 *
 * @return array
 * @private
 */
Gcm.prototype._correlate = function()
{
    var results = this._results;
    if (this._message && results) {
        var tokens = this._message.getToken();
        var token = tokens.shift();

        while(typeof token != 'undefined') {
            results[token] = results.shift();
        }
    }
    return results;
}


// Public fuctions

/**
 * Return the Response message
 * @returns {Message/Gcm}
 */
Gcm.prototype.getMessage = function(){
    return this._message;
}

/**
 * Set GCM Message
 * @param {Message/Gcm} message
 */
Gcm.prototype.setMessage = function(message){
    this._message = message;
}

/**
 * get GCM Response
 * @returns {Object}
 */
Gcm.prototype.getResponse = function(){
    return this._response;
}

/**
 * Set Response
 * @param {Object} response
 */
Gcm.prototype.setResponse = function(response){
    if(
        typeof response.results         == 'undefined' ||
            typeof response.success         == 'undefined' ||
            typeof response.failure         == 'undefined' ||
            typeof response.canonical_ids   == 'undefined' ||
            typeof response.multicast_id    == 'undefined'
        ){
        throw "Response did not contain the proper fields";
    }

    this._response      = response;
    this._results       = response.results;
    this._successCnt    = response.success;
    this._failureCnt    = response.failure;
    this._canonicalCnt  = response.canonical_ids;
    this._id            = response.multicast_id;
}

/**
 * Get Success Count
 *
 * @return int
 */
Gcm.prototype.getSuccessCount = function()
{
    return this._successCnt;
}

/**
 * Get Failure Count
 *
 * @return int
 */
Gcm.prototype.getFailureCount = function()
{
    return this._failureCnt;
}

/**
 * Get Canonical Count
 *
 * @return int
 */
Gcm.prototype.getCanonicalCount = function()
{
    return this._canonicalCnt;
}

/**
 * Get Results
 *
 * @return array multi dimensional array of:
 *         NOTE: key is registration_id if the message is passed.
 *         'registration_id' => array(
 *             'message_id' => 'id',
 *             'error' => 'error',
 *             'registration_id' => 'id'
 *          )
 */
Gcm.prototype.getResults = function()
{
    return this._correlate();
}

/**
 * Get Singular Result
 *
 * @param  {Number}   flag one of the RESULT_* flags
 * @return {Array} singular array with keys being registration id
 *               value is the type of result
 */
Gcm.prototype.getResult = function(flag)
{
    var ret = new Array();
    var correlate = this._correlate();

    for(var k in correlate){
        if(typeof correlate[k][flag] != 'undefined'){
            ret[k] = correlate[k][flag];
        }
    }
    return ret;
}


module.exports = Gcm;