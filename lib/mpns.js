var PushAbstract    = require('./push_abstract'),
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
Mpns.prototype.send = function(message, callback){


    if(!message.validate()){
        throw "The message is not valid";
    }

    var self = this;

    this.connect();


/*
    $client = Core\Request::forge($message->getToken(), array(
        "driver" => "curl",
        "params" => $message->getXmlPayload(),
        "options" => array(
        CURLOPT_HEADER => true
    )
    ),
    "POST"
    );

    $client->set_header("Context-Type", 'text/xml');
    $client->set_header("Accept", 'application/*');
    $client->set_header("X-NotificationClass", $message->getDelay());

    if ($message->getId()) {
        $client->set_header('X-MessageID', $message->getId());
    }
    if ($message->getNotificationType() != Push\Message\Mpns::TYPE_RAW) {
        $client->set_header('X-WindowsPhone-Target', $message->getNotificationType());
    }

    $client->execute();
    $response = $client->response();

    $this->close();
*/
    /*
    var response ;
    switch (response.status)
    {
        case 200:
            // check headers for response?  need to test how this actually works to correctly handle different states.
            if ($response->get_header('NotificationStatus') == 'QueueFull') {
                throw new Push\Exception\DeviceQuotaExceeded('The devices push notification queue is full, use exponential backoff');
            }
            break;
        case 400:
            throw new Push\Exception\InvalidPayload('The message xml was invalid');
            break;
        case 401:
            throw new Push\Exception\InvalidToken('The device token is not valid or there is a mismatch between certificates');
            break;
        case 404:
            throw new Push\Exception\InvalidToken('The device subscription is invalid, stop sending notifications to this device');
            break;
        case 405:
            throw new Exception('Invalid method, only POST is allowed'); // will never be hit unless overwritten
            break;
        case 406:
            throw new Push\Exception\QuotaExceeded('The unauthenticated web service has reached the per-day throttling limit');
            break;
        case 412:
            throw new Push\Exception\InvalidToken('The device is in an inactive state.  You may retry once per hour');
            break;
        case 503:
            throw new Push\Exception\ServerUnavailable('The server was unavailable.');
            break;
        default:
            break;
    }
    return true;

    */
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
}



module.exports = Mpns;


