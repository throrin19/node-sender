var _                   = require('underscore'),
    MessageAbstract     = require('./message_abstract');




var Mpns = function(){

}

Mpns.prototype = new MessageAbstract();


/**
 * Mpns delays
 *
 * @var int
 */
Mpns.prototype.TYPE_RAW        = 'raw';
Mpns.prototype.TYPE_TILE       = 'token';
Mpns.prototype.TYPE_TOAST      = 'toast';


/**
 * Delay while idle
 *
 * @var {Boolean}
 * @private
 */
Mpns.prototype._delay = false;


/**
 * Tokens
 *
 * @var {Array}
 * @private
 */
//Mpns.prototype._tokens = new Array();

/**
 * Set Token
 *
 * @param string $token
 * @return Mpns
 * @throws Exception
 */
Mpns.prototype.setTokenMpns= function (token)
{
    if ( typeof token != "string" ) {
        throw 'token is not a string';
    }
/*
    $val = Core\Validation::forge();
    $val->add("token", 'token')->add_rule('valid_url');
    if (!$val->run(array("token" => $token), true)) {
    throw new Exception('$token is not a valid URI');
}
*/
    return this.setToken(token);
}




/**
 * Validate this is a proper Gcm message
 * Does not validate size.
 *
 * @returns {boolean}
 */
Mpns.prototype.validate = function(){
    if(  ! this._tokens  || this._tokens.length == 0){
        return false;
    }

    return parent.validate();
}





module.exports = Mpns ;