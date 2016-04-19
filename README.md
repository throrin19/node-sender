node-sender
===========

NodeJS Library to push on Iphone, Android, WindowsPhone

## Presentation

NodeJS-push can be easily and simply send push notifications on major existing mobile systems.

### License

* [Apache Version 2.0](http://www.apache.org/licenses/LICENSE-2.0.html)

## Install

```
npm install node-sender
```

## Quick Examples 

### Android (GCM)

```javascript
var Sender = require('node-sender');

Sender.send({
    log     : null,                             // Bunyan logger instance (optional)
    type    : Sender.constants.TYPE_ANDROID,    // OS type
    message : {
        msge : "Test android push"              // message to send
    },
    tokens  : ["your token"],                   // phone(s) registration id(s)
    config  : {
        apiKey : "GCM Api-KEY",
        ttl    : 7200                           // Time to live, (optional, default = 3600 = 1h)
    }
}, function (err, response) {
    console.log(err);
    console.log(response);
});
```

### IOS

```javascript
var Sender = require('node-sender');

Sender.send({
    log     : log,                          // Bunyan logger instance (optional)
    type    : Sender.constants.TYPE_IOS,    // OS type
    message : {
        alert : "your notification",        // message to send
        badge : 1,                          // your badge
        sound : "cat.caf"                   // your notification sound
    },
    tokens  : ["your token"],               // phone(s) registration id(s)
    config  : {
        cert : "path to your cert file",
        key  : "path to your key file",
        ttl  : 7200                         // Time to live, (optional, default = 3600 = 1h)
    }
}, function (err, response) {
    console.log(err);
    console.log(response);
});
```

### Windows Phone

```javascript
var Sender = require('node-sender');

Sender.send({
    log     : log,                          // Bunyan logger instance (optional)
    type    : Sender.constants.TYPE_WP,     // OS type
    message : {
        msge : "Message "                   // message to send
    },
    tokens  : {
        sid    : "your sid",                // Package Security Identifier (SID)
        secret : "your secret",             // Secret password
        url    : ["tokenUrl,...."]          // phone(s) registration id(s)
    },
    config  : {
        ttl : 7200                          // Time to live, (optional, default = 3600 = 1h)
    }

}, function (err, response) {
    console.log(err);
    console.log(response);
});
```

## TODO

- [ ] Refactor Android push system
- [ ] Implement Apple Feedback system
- [ ] Add event pattern to send push fail
- [ ] Use abstract pattern for the three libs

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/throrin19/node-sender/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

