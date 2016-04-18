//var _               = require( 'underscore'),
//    Mpns            = require( "../mpns.js");
//
//
//var Tile = function(){
//
//}
//
//Tile.prototype =  new Mpns();
//
//
///**
// * Mpns delays
// *
// * @var int
// */
//Tile.prototype.DELAY_IMMEDIATE     = 1;
//Tile.prototype.DELAY_450S          = 11;
//Tile.prototype.DELAY_900S          = 21;
//
///**
// * Background Image
// *
// * @var string
// */
//Tile.prototype._backgroundImage;
//
///**
// * Count
// *
// * @var int
// */
//Tile.prototype._count = 0;
//
///**
// * Title
// *
// * @var string
// */
//Tile.prototype._title = "";
//
//
///**
// * Back Background Image
// *
// * @var string
// */
//Tile.prototype._backBackgroundImage;
//
//
///**
// * Back Title
// *
// * @var string
// */
//Tile.prototype._backTitle;
//
///**
// * Back Content
// *
// * @var string
// */
//Tile.prototype._backContent;
//
///**
// * Tile ID
// *
// * @var string
// */
//Tile.prototype._tileId;
//
///**
// * Get Background Image
// *
// * @return string
// */
//Tile.prototype.getBackgroundImage = function ()
//{
//    return this._backgroundImage;
//}
//
//
///**
// * Set Background Image
// *
// * @param string $bgImg
// * @return Tile
//
// */
//Tile.prototype.setBackgroundImage = function (bgImg)
//{
//    if ( typeof bgImg != "string") {
//        throw 'bgImg must be a string';
//    }
//    this._backgroundImage = bgImg;
//    return this;
//}
//
//
///**
// * Get Count
// *
// * @return int
// */
//Tile.prototype.getCount = function()
//{
//    return this._count;
//}
//
///**
// * Set Count
// *
// * @param int $count
// * @return Tile
// * @throws \Push\Message\Exception
// */
//Tile.prototype.setCount = function (count)
//{
//    if ( !count.isNumeric() ) {
//        throw '$count is not numeric';
//    }
//    this._count = Number(count);
//    return this;
//}
//
//
///**
// * Get Title
// *
// * @return string
// */
//Tile.prototype.getTitle = function()
//{
//    return this._title;
//}
//
///**
// * Set Title
// *
// * @param string $title
// * @return Tile
//
// */
//Tile.prototype.setTitle = function (title)
//{
//    if (typeof title != "string" ) {
//        throw 'title must be a string';
//    }
//    this._title = title;
//    return this;
//}
//
//
///**
// * Get Back Background Image
// *
// * @return string
// */
//Tile.prototype.getBackBackgroundImage = function ()
//{
//    return this._backBackgroundImage;
//}
//
///**
// * Set Back Background Image
// *
// * @param string $bgImg
// * @return Tile
// * @throws \Push\Message\Exception
// */
//Tile.prototype.setBackBackgroundImage = function (bgImg)
//{
//    if ( typeof bgImg != "string" ) {
//        throw 'bgImg must be a string';
//    }
//    this._backBackgroundImage = bgImg;
//    return this;
//}
//
///**
// * Get Back Title
// *
// * @return string
// */
//Tile.prototype.getBackTitle = function ()
//{
//    return this._backTitle;
//}
//
//
///**
// * Set Back Title
// *
// * @param string $title
// * @return Tile
// * @throws \Push\Message\Exception
// */
//Tile.prototype.setBackTitle = function (title)
//{
//    if ( typeof title != "string" ) {
//        throw  'title must be a string';
//    }
//    this._backTitle = title;
//    return this;
//}
//
///**
// * Get Back Content
// *
// * @return string
// */
//Tile.prototype.getBackContent = function()
//{
//    return this._backContent;
//}
//
///**
// * Set Back Content
// *
// * @param string $content
// * @return Tile
// * @throws \Push\Message\Exception
// */
//Tile.prototype.setBackContent = function (content)
//{
//    if ( typeof content != "string" ) {
//        throw 'content must be a string';
//    }
//    this._backContent = content;
//}
//
///**
// * Get Tile Id
// *
// * @return string
// */
//Tile.prototype.getTileId = function()
//{
//    return this._tileId;
//}
//
///**
// * Set Tile Id
// *
// * @param string $tileId
// * @return Tile
// * @throws \Push\Message\Exception
// */
//Tile.prototype.setTileId = function (tileId)
//{
//    if ( typeof tileId != "string" ) {
//        throw 'tileId is not a string';
//    }
//    this._tileId = tileId;
//    return this;
//}
//
//
//
///**
// * Get Delay
// *
// * @return int
// */
//Tile.prototype.getDelay = function(){
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
// * @return Tile
// */
//Tile.prototype.setDelay = function(delay)
//{
//    var self = this;
//    if ( ! _.contains(delay , [ self.DELAY_IMMEDIATE , self.DELAY_900S, self.DELAY_450S] ) ){
//        throw "delay must be one of the DELAY_* constants";
//    }
//
//    this._delay = delay;
//    return this;
//}
//
//
//
///**
// * Get Notification Type
// *
// * @return string
// */
//Tile.prototype.getNotificationType = function()
//{
//    return 'token';
//}
//
//
///**
// * Get XML Payload
// *
// * @return string
// */
//Tile.prototype.getXmlPayload = function()
//{
//
//
//    var ret =  '<?xml version="1.0" encoding="utf-8"?>'  + "\n";
//        ret += '<wp:Notification xmlns:wp="WPNotification">'  + "\n";
//        ret += '<wp:Tile' + ( this._tileId ? 'Id="' . jQuery('<div />').text( this._tileId).html()  + '"' : '' ) + '>'  + "\n";
//        ret += '<wp:BackgroundImage>' + jQuery('<div />').text( this._backgroundImage).html()  + '</wp:BackgroundImage>'  + "\n";
//        ret += '<wp:Count>' + this._count + '</wp:Count>'  + "\n";
//        ret += '<wp:Title>' + jQuery('<div />').text( this._title).html()  + '</wp:Title>'  + "\n";
//
//    if (this._backBackgroundImage) {
//        ret += '<wp:BackBackgroundImage>' + jQuery('<div />').text( this._backBackgroundImage).html()  + '</wp:BackBackgroundImage>'  + "\n";
//    }
//    if (this._backTitle) {
//        ret += '<wp:BackTitle>' + jQuery('<div />').text( this._backTitle).html()  + '</wp:BackTitle>'  + "\n";
//    }
//    if (this._backContent) {
//        ret += '<wp:BackContent>' + jQuery('<div />').text( this._backContent).html()  + '</wp:BackContent>'  + "\n";
//    }
//
//    ret += '</wp:Tile>'  + "\n";
//    ret += '</wp:Notification>'  + "\n";
//
//    return ret;
//
//}
//
//
//
//
///**
// * Validate proper mpns message
// *
// * @return boolean
// */
//Tile.prototype.validate = function()
//{
//    if(typeof this._tokens != 'object' || this._tokens.length == 0){
//        return false;
//    }
//    if( this._backgroundImage.length == 0 ){
//        return false;
//    }
//    if( this._title.length == 0 ){
//        return false;
//    }
//
//
//    return true;
//
//}
//
//
//module.exports = Tile;