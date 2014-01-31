node-sender
===========

NodeJS Library to push on Iphone, Android, WindowsPhone, Blackberry 5+

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
    type : Sender.constants.TYPE_ANDROID,           // OS type
    message : {                                     // message to send
        msge : "Node Sender Test Message"
    },
    tokens : "Registration ID here or array IDs",   // phone(s) registration id(s)
    config : {                                      // settings
        apiKey : "GCM Api-KEY"
    }
}, function(err, response){                         // callback
    console.log(err);
    console.log(response);
});
```

### IOS

Coming Soon

### Windows Phone

Coming Soon

### Blackberry 5+ (Java ME)

Coming Soon

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/throrin19/node-sender/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

