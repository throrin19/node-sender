node-sender
===========

NodeJS Library to push on Iphone, Android, WindowsPhone, Blackberry 5+

## Presentation

NodeJS-push can be easily and simply send push notifications on major existing mobile systems.

### License

* [Apache Version 2.0](http://www.apache.org/licenses/LICENSE-2.0.html)

## Download

The source is available for download from GitHub. 

## Quick Examples 

### Android (GCM)

    var Sender = require('node-sender');

    var sender = new Sender();

    sender.send(
        Sender.TYPE_ANDROID,                // OS type
        { msge : "Test Message NodeJS" },   // message to send
        "Registration Id",                  // phone registration id(s)
        { apiKey : "Api-Key GCM" },         // settings
        function(err, response){            // callback
            console.log(err);
            console.log(response);
        }
    );

### IOS

Coming Soon

### Windows Phone

Coming Soon

### Blackberry 5+ (Java ME)

Coming Soon