//var _                   = require('underscore'),
//    MessageAbstract     = require('./message_abstract');
//
///**
// * @Deprecated
// * @constructor
// */
//var Mpns = function(){
//
//}
//
//Mpns.prototype = new MessageAbstract();
//
//
///**
// * Mpns delays
// *
// * @var int
// */
//Mpns.prototype.TYPE_RAW        = 'raw';
//Mpns.prototype.TYPE_TILE       = 'token';
//Mpns.prototype.TYPE_TOAST      = 'toast';
//
//
///**
// * Delay while idle
// *
// * @var {Boolean}
// * @private
// */
//Mpns.prototype._delay = false;
//
//
///**
// * Tokens
// *
// * @var {Array}
// * @private
// */
////Mpns.prototype._tokens = new Array();
//
///**
// * Set Token
// *
// * @param string $token
// * @return Mpns
// * @throws Exception
// */
//Mpns.prototype.setTokenMpns= function (token)
//{
//    if ( typeof token != "string" ) {
//        throw 'token is not a string';
//    }
//
///*
//    var regexp = /^(http(?:s)?\:\/\/[a-zA-Z0-9\-]+(?:\.[a-zA-Z0-9\-]+)*\.[a-zA-Z]{2,6}(?:\/?|(?:\/[\w\-]+)*)(?:\/?|\/\w+\.[a-zA-Z]{2,4}(?:\?[\w]+\=[\w\-]+)?)?(?:\&[\w]+\=[\w\-]+)*)$/;
//    if( ! regexp.test(token)){
//        throw 'Not a valid uri';
//    }
//
//*/
///*
//    $val = Core\Validation ::forge();
//    $val->add("token", 'token')->add_rule('valid_url');
//    if (!$val->run(array("token" => $token), true)) {
//    throw new Exception('$token is not a valid URI');
//}
//*/
//    return this.setToken(token);
//}
//
//
//
//
///**
// * Validate this is a proper Gcm message
// * Does not validate size.
// *
// * @returns {boolean}
// */
//Mpns.prototype.validate = function(){
//    if(  ! this._tokens  || this._tokens.length == 0){
//        return false;
//    }
//
//    return parent.validate();
//}
//
//
//
//
//
//module.exports = Mpns ;