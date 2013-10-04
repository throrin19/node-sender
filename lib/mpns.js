var _               = require( 'underscore'),
    PushAbstract = require('./push_abstract'),
    request         = require('request');

var Mpns = function(){

}

Mpns.prototype = new PushAbstract();


/**
 * Http Client
 *
 * @var Client
 */
Mpns.prototype._httpClient;


/**
 * Get Http Client
 *
 * @return Zend_Http_Client
 */
Mpns.prototype.getHttpClient = function ()
{

    // todo à adapter.
    /*
    if ( ! this._httpClient ) {

        this._httpClient = new Zend_Http_Client();
        this._httpClient->setConfig(array(
            'strictredirects' => true,
        ));
    }
    return $this->_httpClient;
    */
}

/**
 * Set Http Client
 *
 * @return Mpns
 */
Mpns.prototype.setHttpClient = function ( client )
{

    this._httpClient = client;
    return this;
}



/**
 * Send Message
 *
 * @param message {MessageAbstract}
 * @param callback {function}
 */
Mpns.prototype.send = function( message, callback){


    if( ! message.validate()){
        throw "The message is not valid";
    }

    var self = this;

    this.connect();


    console.log(message.getXmlPayload());
    /*
    // todo a adapter.
    request.post(Mpns.SERVER_URI, {
        params : message.getXmlPayload(),

        headers     :   false,
        useragent   :   "Hallgren Networks BB Push Server/1.0",
        encoding    :   'UTF-8',
//        httpauth:
        strictSSL : false
    }, function(e, r, body){
        self.close();

        if(r.statusCode == 401){
            callback("APIKEY error");
        }else if(body.failure == 1){
            callback("Send error", body.results);
        }else{
            callback(e, body);
        }
    });

    */



    var options = {
        body : message.getXmlPayload(),
        xml: true,
        headers : { "Context-Type" :  'text/xml' , "Accept": 'application/*' ,"X-NotificationClass" : message.getDelay() },
        encoding : 'UTF-8',
        strictSSL : false

    };

    if( message.getId() ){
//        'X-MessageID', message.getId()
    }

    if (message.getNotificationType() != Mpns.TYPE_RAW ) {
        //$'X-WindowsPhone-Target', message.getNotificationType();
    }

    request.post(message.getToken(),options
    , function(e, r, body){
        self.close();


        switch(r.statusCode ){
            case 400:
                throw 'The message xml was invalid';
                break;
            case 401:
                throw 'The device token is not valid or there is a mismatch between certificates';
                break;
            case 404:
                throw 'The device subscription is invalid, stop sending notifications to this device';
                break;
            case 405:
                throw 'Invalid method, only POST is allowed'; // will never be hit unless overwritten
                break;
            case 406:
                throw 'The unauthenticated web service has reached the per-day throttling limit';
                break;
            case 412:
                throw 'The device is in an inactive state.  You may retry once per hour';
                break;
            case 503:
                throw 'The server was unavailable.';
                break;
            default:
                break;

        }
            /*
        if(r.statusCode == 401){
            callback("APIKEY error");
        }else if(body.failure == 1){
            callback("Send error", body.results);
        }else{
            callback(e, body);
        }
        */
    });

}



module.exports = Mpns;


