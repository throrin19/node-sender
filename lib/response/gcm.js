/**
 *
 * @param {String} responseString : JSON encoded Message
 * @param {Message/Gcm} message
 * @constructor
 */
var Gcm = function(responseString, message){

    // protected vars declaration
    var _id            = null,
        _successCnt    = null,
        _failureCnt    = null,
        _canonicalCnt  = null,
        _message       = null,
        _results       = null,
        _response      = null;

    // private functions

    /**
     * Correlate Message and Result
     *
     * @return array
     */
    _correlate = function()
    {
        var results = _results;
        if (_message && results) {
            var tokens = _message.getToken();
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
    this.getMessage = function(){
        return _message;
    }

    /**
     * Set GCM Message
     * @param {Message/Gcm} message
     */
    this.setMessage = function(message){
        _message = message;
    }

    /**
     * get GCM Response
     * @returns {Object}
     */
    this.getResponse = function(){
        return _response;
    }

    /**
     * Set Response
     * @param {Object} response
     */
    this.setResponse = function(response){
        if(
            typeof response.results         == 'undefined' ||
            typeof response.success         == 'undefined' ||
            typeof response.failure         == 'undefined' ||
            typeof response.canonical_ids   == 'undefined' ||
            typeof response.multicast_id    == 'undefined'
        ){
            throw "Response did not contain the proper fields";
        }

        _response      = response;
        _results       = response.results;
        _successCnt    = response.success;
        _failureCnt    = response.failure;
        _canonicalCnt  = response.canonical_ids;
        _id            = response.multicast_id;
    }

    /**
     * Get Success Count
     *
     * @return int
     */
    this.getSuccessCount = function()
    {
        return _successCnt;
    }

    /**
     * Get Failure Count
     *
     * @return int
     */
    this.getFailureCount = function()
    {
        return _failureCnt;
    }

    /**
     * Get Canonical Count
     *
     * @return int
     */
    this.getCanonicalCount = function()
    {
        return _canonicalCnt;
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
    this.getResults = function()
    {
        return _correlate();
    }

    /**
     * Get Singular Result
     *
     * @param  {Number}   flag one of the RESULT_* flags
     * @return {Array} singular array with keys being registration id
     *               value is the type of result
     */
    this.getResult = function(flag)
    {
        var ret = new Array();
        var correlate = _correlate();

        for(var k in correlate){
            if(typeof correlate[k][flag] != 'undefined'){
                ret[k] = correlate[k][flag];
            }
        }
        return ret;
    }


    // constructor code

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


module.exports = Gcm;