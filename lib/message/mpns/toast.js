var _               = require( 'underscore'),
    Mpns            = require( "../mpns");
    //jquery          = require("../../../vendors/jquery_min.js")


var Toast = function(){

}

Toast.prototype = Mpns;


/**
 * Mpns delays
 *
 * @var int
 */
Toast.DELAY_IMMEDIATE     = 2;
Toast.DELAY_450S          = 12;
Toast.DELAY_900S          = 22;



/**
 * Title
 *
 * @var string
 */
Toast.prototype._title = "";


/**
 * Message
 *
 * @var string
 */
Toast.prototype._msg = "";


/**
 * Params
 *
 * @var string
 */
Toast.prototype._params = "";


/**
 * Get Title
 *
 * @return string
 */
Toast.prototype.getTitle = function()
{
    return this._title;
}

/**
 * Set Title
 *
 * @param string $title
 * @return Toast

 */
Toast.prototype.setTitle = function (title)
{
    if (typeof title != "string" ) {
        throw 'title must be a string';
    }
    this._title = title;
    return this;
}

/**
 * Get Message
 *
 * @return string
 */
Toast.prototype.getMessage = function ()
{
    return this._msg;
}




/**
 * Set Message
 *
 * @param string $msg XML string
 * @return Toast
 */
Toast.prototype.setMessage = function (msg)
{
    if (typeof msg != "string") {
    throw 'msg is not a string';
}

    this._msg = msg;

    return this;
}


/**
 * Get Params
 *
 * @return string
 */
Toast.prototype.getParams = function()
{
    return this._params;
}


/**
 * Set Params
 *
 * @param string $params
 * @return Toast
 */
Toast.prototype.setParams = function (params)
{
    if (typeof params != "string" ) {
        throw 'params must be a string';
    }
    this._params = params;
    return this;
}


/**
 * Get Delay
 *
 * @return int
 */
Toast.prototype.getDelay = function(){

}
{
    if (! this._delay) {
        return this.DELAY_IMMEDIATE;

    }
    return this._delay;
}

/**
 * Set Delay
 *
 * @param int $delay
 * @return Toast
 */
Toast.prototype.setDelay = function(delay)
{
    var self = this;
    if ( ! _.contains(delay , [ self.DELAY_IMMEDIATE , self.DELAY_900S, self.DELAY_450S] ) ){
        throw "delay must be one of the DELAY_* constants";
    }

    this._delay = delay;
    return this;
}



/**
 * Get Notification Type
 *
 * @return string
 */
Toast.prototype.getNotificationType = function()
{
    return 'Toast';
}


/**
 * Get XML Payload
 *
 * @return string
 */
Toast.prototype.getXmlPayload = function()
{

    var ret = '<?xml version="1.0" encoding="utf-8"?>' + "\n";
        ret += '<wp:Notification xmlns:wp="WPNotification">' + "\n";
        ret +=  '<wp:Toast>' + "\n";
        ret +=  '<wp:Text1>' + jQuery('<div />').text( this._title ).html() + '</wp:Text1>' + "\n";
        ret +=  '<wp:Text2>' + jQuery('<div />').text( this._msg).html() + '</wp:Text2>' + "\n";
    if ( this._params.length != 0 ) {
        ret += '<wp:Param>' + jQuery('<div />').text( this._params).html() + '</wp:Param>' + "\n";
    }
        ret += '</wp:Toast>' + "\n";
        ret +=  '</wp:Notification>' + "\n";

    return ret;

}




/**
 * Validate proper mpns message
 *
 * @return boolean
 */
Toast.prototype.validate = function()
{
    if(typeof this._tokens != 'object' || this._tokens.length == 0){
        return false;
    }
    if( this._msg.length == 0 ){
        return false;
    }
    if( this._title.length == 0 ){
        return false;
    }


    return true;

}