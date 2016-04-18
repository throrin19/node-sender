//var _               = require( 'underscore'),
//    Mpns            = require( "../mpns.js");
//
//
//var Raw = function(){
//
//}
//
//Raw.prototype =  new Mpns();
//
//
///**
// * Mpns delays
// *
// * @var int
// */
//    Raw.prototype.DELAY_IMMEDIATE     = 3;
//    Raw.prototype.DELAY_450S          = 13;
//    Raw.prototype.DELAY_900S          = 23;
//
//
///**
// * Message
// *
// * @var string
// */
//Raw.prototype._msg = "";
//
//
///**
// * Get Delay
// *
// * @return int
// */
//Raw.prototype.getDelay = function(){
//
//    if (! this._delay) {
//        return this.DELAY_IMMEDIATE;
//
//    }
//    return this._delay;
//}
//
///**
// * Set Delay
// *
// * @param int $delay
// * @return Raw
// */
//Raw.prototype.setDelay = function(delay)
//{
//    var self = this;
//    if ( ! _.contains(delay , [ self.DELAY_IMMEDIATE , self.DELAY_900S, self.DELAY_450S] ) ){
//         throw "delay must be one of the DELAY_* constants";
//    }
//
//    this._delay = delay;
//    return this;
//}
//
//
///**
// * Set Message
// *
// * @param string $msg XML string
// * @return Raw
// */
//Raw.prototype.setMessage= function (msg)
//{
//    if (typeof msg != "string") {
//        throw 'msg is not a string';
//    }
//
//
//    try {
//        xmlDoc = $.parseXML(msg);
//    } catch (err) {
//        throw '$msg is not valid xml';
//    }
//
//    this._msg = msg;
//
//    return this;
//}
//
///**
// * Get Message
// *
// * @return string
// */
//Raw.prototype.getMessage = function()
//{
//    return this._msg;
//}
//
//
///**
// * Get Notification Type
// *
// * @return string
// */
//Raw.prototype.getNotificationType = function()
//{
//    return 'raw';
//}
//
//
///**
// * Get XML Payload
// *
// * @return string
// */
//Raw.prototype.getXmlPayload = function()
//{
//    return this._msg;
//}
//
//
//
///**
// * Validate proper mpns message
// *
// * @return boolean
// */
//Raw.prototype.validate = function()
//{
//    if(typeof this._tokens != 'object' || this._tokens.length == 0){
//        return false;
//    }
//    if( this._msg.length == 0 ){
//        return false;
//    }
//
//
//    return true;
//}
//
//module.exports = Raw;