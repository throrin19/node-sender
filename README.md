node-sender
===========

NodeJS Library to push on iPhone, Android, WindowsPhone.

## Presentation

node-sender can be easily and simply send push notifications on major 
existing mobile systems.

### License

* [Apache Version 2.0](http://www.apache.org/licenses/LICENSE-2.0.html)

## Install

```
npm install node-sender
```

## Quick Examples 

### At the beginning

You need to import the sender library.

```javascript
var Sender = require('node-sender');
```

### Android (GCM)

```javascript
var sender = Sender.send({
    log     : log,                                  
    // Bunyan logger instance (optional)
    
    type    : Sender.constants.TYPE_ANDROID,        
    // OS type
    
    message : {
        title         : "your title",               
        // notification title 
        
        body          : "Test android push",        
        // message to send (optional)
        
        any_other_Key : "that you want to send"     
        // other data you want to send, see GCM's doc
    },
    tokens  : ["your token"],                       
    // phone(s) registration id(s)
    
    config  : {
        apiKey : "GCM Api-KEY",
        ttl    : 7200                               
        // Time to live, (optional, default = 3600 = 1h)
    }
});
```

### iOS (APNs HTTP/2)

```javascript
var Sender = require('node-sender');

var sender = Sender.send({
    log     : log,                          
    // Bunyan logger instance (optional)
    
    type    : Sender.constants.TYPE_IOS,    
    // OS type
    
    message : {
        alert : "your notification",        
        // message to send
        
        badge : 1,                          
        // your badge
        
        sound : "cat.caf"                   
        // your notification sound
    },
    tokens  : ["your token"],               
    // phone(s) registration id(s)
    
    config  : {
        cert : "path to your cert file",
        key  : "path to your key file",
        
        ttl  : 7200,                        
        // Time to live, (optional, default = 3600 = 1h)
        
        production : true                   
        // If your application is on the production APNS
    }
});
```

### Windows Phone (WNS)

```javascript
var sender = Sender.send({
    log     : log,                          
    // Bunyan logger instance (optional)
    
    type    : Sender.constants.TYPE_WP,     
    // OS type
    
    message : {
        msge : "Message "                   
        // message to send
    },
    tokens  : {
        url : ["tokenUrl,...."]             
        // phone(s) registration id(s)
    },
    config  : {
        sid    : "your sid",                
        // Package Security Identifier (SID)
        
        secret : "your secret",             
        // Secret password
        
        ttl    : 7200                       
        // Time to live, (optional, default = 3600 = 1h)
    }
});
```

:warning: Important: If there is a parameters problem, it'll be throw and not send through callback or event system !

### How to retrieve the failed/successful notifications

:heavy_exclamation_mark: Important: You can't use the both system at the same time !

#### Callback

You can use the callback system like that 
(the token and config SID/Secret are wrong ;) )

```javascript
Sender.send({
    type    : Sender.constants.TYPE_WP,
    message : {
        msge : "My beautiful notification"
    },
    tokens  : {
        url : ["AOBCIAHJSJAOPFIABFNHAONODBF"]
    },
    config  : {
        sid    : "ogdjqfqopfnsdopbgfdoqfn",
        secret : "fdognpsdfogopdfgjonfdgodfgn",
    }
}, (error, result)=> {
    if (!error) {
        console.log(result.successful);
        console.log(result.failed);
        console.log(result.unregistered);
    }
});
```

##### EventEmitter

Or you can use the EventEmitter system

```javascript
var sender = Sender.send({
    type    : Sender.constants.TYPE_WP,
    message : {
        msge : "My beautiful notification"
    },
    tokens  : {
        url : ["AOBCIAHJSJAOPFIABFNHAONODBF"]
    },
    config  : {
        sid    : "ogdjqfqopfnsdopbgfdoqfn",
        secret : "fdognpsdfogopdfgjonfdgodfgn",
    }
});
sender.on("error", (err) => {
    // When there is an error, it triggers this event.
});
sender.on("successful", (token) => {
    // Each successful push triggers this event 
    // with the token and message_id.
});
sender.on("failed", (error) => {
    // Each failed push triggers this event with the 
    // token and the statusCode or error.
});
sender.on("unregistered", (token) => {
    // Each push where the device is not registered (uninstalled app) 
    // triggers this event instead of the "failed" event.
});
sender.on("end", (results) => {
    // Contains success, failed and unregistered arrays of 
    // notifications responses data 
    // (if there are some).
    
    console.log(results.successful);
    console.log(results.failed);
    console.log(results.unregistered);
});
```

## TODO

- [X] Refactor Android push system
- [X] Implement Apple Feedback system
- [X] Implement WNS Feedback system
- [X] Implement GCM Feedback system
- [X] Add event pattern to send push fail
- [ ] ~~Use abstract pattern for the three libs~~

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/throrin19/node-sender/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

