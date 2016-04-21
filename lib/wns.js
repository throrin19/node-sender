"use strict";
/** @const */
const js2xmlparser = require("js2xmlparser"),
    Request = require("request"),
    url = require("url"),
    util = require("util"),
    EventEmitter = require("events"),
    async = require("async"),
    _ = require("underscore"),
    bunyan = require('bunyan');

/**
 * WNS lib to send notification to WindowsPhone devices.
 * @param {object} options.log Bunyan logger
 * @constructor
 */
var Wns = function WNS(options) {
    EventEmitter.call(this);
    this._log = options.log.child({ component : 'wns-sender' });
};
util.inherits(Wns, EventEmitter);

/**
 * maps template name to the number of image elements and text elements it requires
 * based on tile notification templates and TOAST notification templates.
 * like : Name [ nbImages , nbText ].
 *
 * @see {@link http://msdn.microsoft.com/en-us/library/windows/apps/hh761491.aspx}
 * @see {@link http://msdn.microsoft.com/en-us/library/windows/apps/hh761494.aspx}
 *
 * @const
 */
Wns.templateSpecs = {
    "TileSquareBlock"               : [0, 2],
    "TileSquareText01"              : [0, 4],
    "TileSquareText02"              : [0, 2],
    "TileSquareText03"              : [0, 4],
    "TileSquareText04"              : [0, 1],
    "TileWideText01"                : [0, 5],
    "TileWideText02"                : [0, 9],
    "TileWideText03"                : [0, 1],
    "TileWideText04"                : [0, 1],
    "TileWideText05"                : [0, 5],
    "TileWideText06"                : [0, 10],
    "TileWideText07"                : [0, 9],
    "TileWideText08"                : [0, 10],
    "TileWideText09"                : [0, 2],
    "TileWideText10"                : [0, 9],
    "TileWideText11"                : [0, 10],
    "TileSquareImage"               : [1, 0],
    "TileSquarePeekImageAndText01"  : [1, 4],
    "TileSquarePeekImageAndText02"  : [1, 2],
    "TileSquarePeekImageAndText03"  : [1, 4],
    "TileSquarePeekImageAndText04"  : [1, 1],
    "TileWideImage"                 : [1, 0],
    "TileWideImageCollection"       : [5, 0],
    "TileWideImageAndText01"        : [1, 1],
    "TileWideImageAndText02"        : [1, 2],
    "TileWideBlockAndText01"        : [0, 6],
    "TileWideBlockAndText02"        : [0, 3],
    "TileWideSmallImageAndText01"   : [1, 1],
    "TileWideSmallImageAndText02"   : [1, 5],
    "TileWideSmallImageAndText03"   : [1, 1],
    "TileWideSmallImageAndText04"   : [1, 2],
    "TileWideSmallImageAndText05"   : [1, 2],
    "TileWidePeekImageCollection01" : [5, 2],
    "TileWidePeekImageCollection02" : [5, 5],
    "TileWidePeekImageCollection03" : [5, 1],
    "TileWidePeekImageCollection04" : [5, 1],
    "TileWidePeekImageCollection05" : [6, 2],
    "TileWidePeekImageCollection06" : [6, 1],
    "TileWidePeekImageAndText01"    : [1, 1],
    "TileWidePeekImageAndText02"    : [1, 5],
    "TileWidePeekImage01"           : [1, 2],
    "TileWidePeekImage02"           : [1, 5],
    "TileWidePeekImage03"           : [1, 1],
    "TileWidePeekImage04"           : [1, 1],
    "TileWidePeekImage05"           : [2, 2],
    "TileWidePeekImage06"           : [2, 1],
    "ToastText01"                   : [0, 1],
    "ToastText02"                   : [0, 2],
    "ToastText03"                   : [0, 2],
    "ToastText04"                   : [0, 3],
    "ToastImageAndText01"           : [1, 1],
    "ToastImageAndText02"           : [1, 2],
    "ToastImageAndText03"           : [1, 2],
    "ToastImageAndText04"           : [1, 3]
};

/**
 * Wns response codes
 *
 * @see {@link http://msdn.microsoft.com/en-us/library/windows/apps/hh465435.aspx#send_notification_response}
 *
 * @const
 */
Wns.responseCodes = {
    400 : "One or more headers were specified incorrectly or conflict with another header.",
    401 : "The cloud service did not present a valid authentication ticket. The OAuth ticket may be invalid.",
    403 : "The cloud service is not authorized to send a notification to this URI even though they are authenticated.",
    404 : "The channel URI is not valid or is not recognized by Wns.",
    405 : "Invalid method (GET, DELETE, CREATE); only POST is allowed.",
    406 : "The cloud service exceeded its throttle limit.",
    410 : "The channel expired.",
    413 : "The notification payload exceeds the 5000 byte size limit.",
    500 : "An internal failure caused notification delivery to fail.",
    503 : "The server is currently unavailable."
};

/**
 * valid badge values
 *
 * @see {@link http://msdn.microsoft.com/en-us/library/windows/apps/br212849.aspx}
 *
 * @const
 */
Wns.badges = [
    "none",
    "activity",
    "alert",
    "available",
    "away",
    "busy",
    "newMessage",
    "paused",
    "playing",
    "unavailable",
    "error"
];

/**
 * valid notification types
 *
 * @see {@link http://msdn.microsoft.com/en-us/library/windows/apps/hh465435.aspx}
 *
 * @const
 */
Wns.types = {
    TOAST : "toast",
    BADGE : "badge",
    TILE  : "tile",
    RAW   : "raw"
};

/**
 * The NotificationClass is the batching interval that indicates when the push notification will be sent to the app from the push notification service.
 *
 * @see {@link https://msdn.microsoft.com/fr-fr/library/windows/apps/hh202945%28v=vs.105%29.aspx}
 *
 * @const
 */
Wns.notificationClass = {
    // Immediate delivery.
    "immediate" : {
        "toast" : 2,
        "badge" : 3,
        "tile"  : 1,
        "raw"   : 3
    },
    // Delivered within 450 seconds.
    "medium"    : {
        "toast" : 12,
        "badge" : 13,
        "tile"  : 11,
        "raw"   : 13
    },
    // Delivered within 900 seconds.
    "slow"      : {
        "toast" : 22,
        "badge" : 23,
        "tile"  : 21,
        "raw"   : 23
    }
};

/**.
 * Microsoft HTTP Header key
 *
 * @const
 */
Wns.microsoftCustomHeaderKeys = {
    request  : {
        type               : "X-WNS-Type",
        notificationClass  : "X-NotificationClass",
        windowsPhoneTarget : "X-WindowsPhone-Target",
        messageId          : "X-MessageID", // UUID
        cachePolicy        : "X-WNS-Cache-Policy", // optional
        notificationTTL    : "X-WNS-TTL", // optional
        requestStatus      : "X-WNS-RequestForStatus" // optional
    },
    response : {
        notificationStatus     : "X-WNS-NotificationStatus",
        subscriptionStatus     : "X-WNS-SubscriptionStatus",
        errorDescription       : "X-WNS-Error-Description",
        deviceConnectionStatus : "X-WNS-DeviceConnectionStatus",
        WnsMessageId           : "X-WNS-Msg-ID",
        debugTrace             : "X-WNS-Debug-Trace",
        wnsStatus              : "X-WNS-Status"
    }
};

/** @const */
Wns.toastAudioSource = "ms-winsoundevent:Notification.";

/** @const */
Wns.audioSources = ["Default", "IM", "Mail", "Reminder", "SMS", "Alarm", "Looping.Alarm2", "Looping.Call", "Looping.Call2"];

/**
 * This function the JSON layout for Toast or Tile notification.
 *
 * @param {json}             data                - JSON layout.
 *       basic structure of a payload for a toast or tile notification :                                            </br>
 *               data : {                                                                                           </br>
 *                   text  : [ "text1", "text2" ],                                                                  </br>
 *                   image : [                                                                                      </br>
 *                       { src : "urlImage1", alt : "altImage1" },                                                  </br>
 *                       { src : "urlImage2", alt : "altImage2" }                                                   </br>
 *                   ],                                                                                             </br>
 *                   sound : { src : "Default", loop : true }                                                       </br>
 *               }.                                                                                                 </br>
 *
 * @param {string}                  data.template       - XML Layout template (determine the number of image and text)
 *                                                        see const templateSpecs.
 *
 * @param {string}                  data.type           - Layout type (toast, tile).
 * @see types
 *
 * @param {object}                  [data.sound]        - When the type is toast, you can set the notification sound.
 *
 * @param {object[]}                [data.image]        - All images data, must be longer or equals than the template's image number.
 *
 * @param {string[]}                [data.text]         - All texts, must be longer or equals than the template's text number.
 *
 * @private
 */
Wns.prototype._verifyLayout = function (data) {
    if (data.hasOwnProperty("template")) {
        if (!data.hasOwnProperty("image")) {
            data.image = [];
        }
        if (Wns.templateSpecs[data.template][0] < data.image.length) {
            this._log.warn("not all images will be used in the template");
        }
        if (Wns.templateSpecs[data.template][0] > data.image.length) {
            this._log.error("Not enough images data too fill the template");
            throw new Error("Not enough images data too fill the template");
        }
        if (Wns.templateSpecs[data.template][1] < data.text.length) {
            this._log.warn("not all texts will be used in the template");
        }
        if (Wns.templateSpecs[data.template][1] > data.text.length) {
            this._log.error("Not enough texts data too fill the template");
            throw new Error("Not enough texts data too fill the template");
        }
    }
    if (data.hasOwnProperty("sound") && (!Wns.audioSources[data.sound] || data.type != Wns.types.TOAST)) {
        this._log.debug("sound not set or wrong, no sound used");
        delete data.sound;
    }
    return data;
};

/**
 * This function generate a XML layout for Toast or Tile notification from a JSON layout.
 *
 * @param {json}             data                - JSON layout.
 *       basic structure of a payload for a toast or tile notification :                                            </br>
 *               data : {                                                                                           </br>
 *                   text  : [ "text1", "text2" ],                                                                  </br>
 *                   image : [                                                                                      </br>
 *                       { src : "urlImage1", alt : "altImage1" },                                                  </br>
 *                       { src : "urlImage2", alt : "altImage2" }                                                   </br>
 *                   ],                                                                                             </br>
 *                   sound : { src : "Default", loop : true }                                                       </br>
 *               }.                                                                                                 </br>
 *
 * @param {string}                  data.template       - XML Layout template (determine the number of image and text)
 *                                                        see const templateSpecs.
 *
 * @param {string}                  data.type           - Layout type (toast, tile).
 * @see types
 *
 * @param {object}                  [data.sound]        - When the type is toast, you can set the notification sound.
 *
 * @param {object[]}                [data.image]        - All images data, must be longer or equals than the template's image number.
 *
 * @param {string[]}                [data.text]         - All texts, must be longer or equals than the template's text number.
 *
 * @private
 */
Wns.prototype._generatePayLoad = function (data) {
    var binding = {
        "@" : {
            "template" : data.template
        }
    };
    for (var i = 0; i < Wns.templateSpecs[data.template][0]; i++) {
        if (i == 0) {
            binding["image"] = [];
        }
        binding["image"].push({
            "@" : { // ATTRIBUTES
                "id"  : i + 1,
                "alt" : data.image[i].alt,
                "src" : data.image[i].src
            }
        });
    }
    for (var j = 0; j < Wns.templateSpecs[data.template][1]; j++) {
        if (j == 0) {
            binding["text"] = [];
        }
        binding["text"].push({
            "@" : { // ATTRIBUTES
                "id" : j + 1
            },
            "#" : data.text[j] // VALUES
        });
    }
    if (data.type === Wns.types.TOAST && data.sound) {
        binding["audio"] = {
            "@" : {
                "src"  : Wns.toastAudioSource + data.sound.src,
                "loop" : "false"
            }
        };
    }
    var visual = { "visual" : { "binding" : binding } };
    this._log.debug(visual);
    return js2xmlparser(data.type, visual, { prettyPrinting : { enabled : false } });
};

/**
 * This function request to microsoft a token access to WNS server.
 *
 * @param {object}          params                      - Function's parameters.
 *
 * @param {string}          params.client_id            - Package Security Identifier (SID) from microsoft developer dashboard.
 *
 * @param {string}          params.client_secret        - Secret from microsoft developer dashboard.
 *
 * @param {int}             [params.timeout]            - Timeout value of the request.
 *
 * @return {Promise}                                    - The promise if the token was obtained or not.
 *
 * @private
 */
Wns.prototype._obtainAccessToken = function (params) {
    var payload = {
        query : {
            grant_type    : "client_credentials",
            client_id     : params.client_id,
            client_secret : params.client_secret,
            scope         : "notify.windows.com"
        }
    };
    var request = {
        uri     : "https://login.live.com/accesstoken.srf",
        url     : "https://login.live.com/accesstoken.srf",
        timeout : params.timeout,
        method  : "POST",
        host    : "https://login.live.com",
        headers : {
            "Content-Type" : "application/x-www-form-urlencoded"
        },
        body    : url.format(payload).substring(1) // strip leading ?
    };
    this._log.debug({ req : request }, "Access token request");
    return new Promise((fulfill, reject) => {
        Request.post(request, (err, res) => {
            this._log.debug({ res : res }, "Access token response");
            if (err || res.statusCode != 200) {
                reject(err, res);
            } else {
                fulfill(JSON.parse(res.body)["access_token"]);
            }
        });
    });
};

/**
 * This function send a notification to one or a group of windowsPhone devices.
 * Only Toast and Tile notification type are implemented,
 * raw type request must have their XML layout in the payload params.
 *
 * @param {object}         params                        - Function's parameters.
 *
 * @param {object}         params.payload                - Data sent in the notification
 * @see _generatePayLoad
 *
 * @param {string}         [params.payload.sound.src]    - Set the sound when toast notification appear
 *                                                         (Default, IM, Mail, Reminder, SMS, Alarm, Looping.Alarm2, Looping.Call, Looping.Call2).
 * @see audioSources
 *
 * @param {boolean}        [params.payload.sound.loop]   - Set the loop value of the toast notification sound.
 *
 * @param {string[]}       params.tokenUrl               - All the url of the device who will receive the notification.
 *
 * @param {string}         params.client_id              - Package Security Identifier (SID) from microsoft developer dashboard.
 *
 * @param {string}         params.client_secret          - Secret from microsoft developer dashboard.
 *
 * @param {string}         [params.type]                 - Type of the notification (toast, tile, badge, raw)
 *                                                        (default = toast).
 * @see types
 *
 * @param {string}         [params.template]             - Template of the notification
 *                                                        (only for toast and tile notification)
 *                                                        (default = ToastText01|TileSquareText04).
 * @see templateSpecs
 *
 * @param {string}         [params.notificationClass]    - Batching interval that indicates when
 *                                                        the push notification will be sent to the app
 *                                                        (immediate, medium, slow) (default = immediate).
 * @see notificationClass
 *
 * @param {int}            [params.timeout]              - Timeout value of the two request (token request & notification request).
 *
 * @param {int}            [params.ttl]                  - Notification's expiration time (in second) (default = 3600)
 *
 * @param {function}       callback                      - callback function.
 */
Wns.prototype.send = function (params, callback) {
    this._log.trace({ params : params }, "Send()'s params");
    if (!params.hasOwnProperty("payload")) {
        this._log.error("No notification data (payload)");
        throw new Error("No notification data (payload)");
    }
    if (!params.hasOwnProperty("tokenUrl")) {
        this._log.error("No token URL");
        throw new Error("No token URL");
    }
    if (!params.hasOwnProperty("client_id")) {
        this._log.error("No client ID");
        throw new Error("No client ID");
    }
    if (!params.hasOwnProperty("client_secret")) {
        this._log.error("No client secret");
        throw new Error("No client secret");
    }
    var data = params.payload;
    if (!params.hasOwnProperty("type") || !_.contains(_.values(Wns.types), params.type)) {
        data.type = Wns.types.TOAST;
        this._log.debug("type not set or wrong, " + data.type + " used");
    } else {
        data.type = params.type;
    }
    if (!data.hasOwnProperty("template") || !Wns.templateSpecs[data.template] && (data.type != "raw" || data.type != "badge")) {
        data.template = data.type === Wns.types.TOAST ? "ToastText01" : "TileSquareText04";
        this._log.debug("template not set or wrong, " + data.template + " used");
    }
    if (!params.hasOwnProperty("notificationClass")) {
        this._log.debug("notificationClass, immediate value used");
        params.notificationClass = "immediate";
    }
    if (!params.hasOwnProperty("ttl") || params.ttl <= 0) {
        params.ttl = 3600;
    }
    this._log.trace(data);
    var payLoad = data.type === Wns.types.RAW ? params.payload : this._generatePayLoad(this._verifyLayout(data));
    this._log.debug(payLoad);
    var options = {
        method  : "POST",
        timeout : params.timeout,
        headers : {
            "Content-Type"   : "text/xml",
            "Content-Lenght" : Buffer.byteLength(payLoad, "utf8")
        }
    };
    options.headers[Wns.microsoftCustomHeaderKeys.request.type] = "wns/" + data.type;
    options.headers[Wns.microsoftCustomHeaderKeys.request.requestStatus] = "true";
    options.headers[Wns.microsoftCustomHeaderKeys.request.notificationClass] = params.notificationClass[data.type];
    options.headers[Wns.microsoftCustomHeaderKeys.request.ttl] = params.ttl;
    options.body = payLoad;
    let request = this._obtainAccessToken({
        client_id     : params.client_id,
        client_secret : params.client_secret,
        timeout       : params.timeout
    });
    request.then(  // fulfilled
        (access_token) => {
            options.headers["Authorization"] = "Bearer " + access_token;
            var results = [];
            async.each(params.tokenUrl, (tokenUrl, asyncCallback) => {
                options.uri = tokenUrl;
                options.headers[Wns.microsoftCustomHeaderKeys.request.messageId] = Wns.UUID.generate();
                this._log.trace({ req : options }, "Request WNS");
                Request.post(options, (err, res) => {
                    if (err) {
                        let error = {
                            error : err,
                            token : tokenUrl
                        };
                        this._log.error(error, "Error while sending the notification request");
                        results.push(error);
                        this.emit("failed", error);
                    } else {
                        var jsonResponse = res.toJSON();
                        this._log.trace({ res : jsonResponse }, "Notification WNS response");
                        var result = {
                            tokenUrl               : tokenUrl,
                            statusCode             : jsonResponse.statusCode,
                            subscriptionStatus     : jsonResponse.headers[Wns.microsoftCustomHeaderKeys.response.subscriptionStatus.toLowerCase()],
                            errorDescription       : jsonResponse.headers[Wns.microsoftCustomHeaderKeys.response.errorDescription.toLowerCase()],
                            deviceConnectionStatus : jsonResponse.headers[Wns.microsoftCustomHeaderKeys.response.deviceConnectionStatus.toLowerCase()],
                            WnsMessageId           : jsonResponse.headers[Wns.microsoftCustomHeaderKeys.response.WnsMessageId.toLowerCase()],
                            debugTrace             : jsonResponse.headers[Wns.microsoftCustomHeaderKeys.response.debugTrace.toLowerCase()],
                            wnsStatus              : jsonResponse.headers[Wns.microsoftCustomHeaderKeys.response.wnsStatus.toLowerCase()],
                            responseText           : Wns.responseCodes[jsonResponse.statusCode],
                            body                   : jsonResponse.body
                        };
                        if (jsonResponse.statusCode === 200) {
                            let info = {
                                token : tokenUrl,
                                id : result.WnsMessageId
                            };
                            this._log.debug(info, "Notification sent");
                            this.emit("successful", info);
                            results.push(info);
                        } else {
                            let info = {
                                error      : {
                                    errorDescription : result.errorDescription,
                                    response         : result.responseText
                                },
                                token      : tokenUrl,
                                statusCode : result.statusCode
                            };
                            this._log.debug(info, "Notification fail");
                            if (jsonResponse.statusCode === 410) {
                                info.unregistered = true;
                                this.emit("unregistered", info);
                            } else {
                                this.emit("failed", info);
                            }
                            results.push(info);
                        }
                    }
                    asyncCallback();
                });
            }, (err) => {
                if (err) {
                    throw err;
                }
                let data = {
                    success      : [],
                    failure      : [],
                    unregistered : []
                };
                results.forEach(response => {
                    if (response.unregistered) {
                        data.unregistered.push(response);
                    } else if (response.error) {
                        data.failure.push(response);
                    } else {
                        data.success.push(response);
                    }
                });
                this.emit("end", data);
                callback(err, data)
            });
        });
    request.catch( // failed
        (err, res) => {
            if (!err) {
                var jsonResult = res.toJSON();
                var body = JSON.parse(jsonResult.body);
                this._log.error({
                    name : body["error"],
                    desc : body["error_description"]
                }, "When obtaining access token");
                callback(new Error("When obtaining access token : Name : " + body["error"] + ", Desc :  " + body["error_description"]));
            } else {
                this._log.error({ err : err }, "Can't get an access token from microsoft");
                callback(new Error("Can't get an access token from microsoft : " + err));
            }
        });
};

/**
 * Fast UUID generator, RFC4122 version 4 compliant.
 * @author Jeff Ward (jcward.com).
 * @license MIT license
 * @link http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/21963136#21963136
 **/
Wns.UUID = (function () {
    var self = {};
    var lut = [];
    for (var i = 0; i < 256; i++) {
        lut[i] = (i < 16 ? "0" : "") + (i).toString(16);
    }
    self.generate = function () {
        var d0 = Math.random() * 0xffffffff | 0;
        var d1 = Math.random() * 0xffffffff | 0;
        var d2 = Math.random() * 0xffffffff | 0;
        var d3 = Math.random() * 0xffffffff | 0;
        return lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff] + "-" +
            lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + "-" + lut[d1 >> 16 & 0x0f | 0x40] + lut[d1 >> 24 & 0xff] + "-" +
            lut[d2 & 0x3f | 0x80] + lut[d2 >> 8 & 0xff] + "-" + lut[d2 >> 16 & 0xff] + lut[d2 >> 24 & 0xff] +
            lut[d3 & 0xff] + lut[d3 >> 8 & 0xff] + lut[d3 >> 16 & 0xff] + lut[d3 >> 24 & 0xff];
    };
    return self;
})();

module.exports = Wns;