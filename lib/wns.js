"use strict";
/** @const */
const js2xmlparser = require("js2xmlparser"),
    request = require("request"),
    url = require("url"),
    util = require("util"),
    EventEmitter = require("events"),
    winston = require("winston"),
    async = require("async"),
    _ = require("underscore");

var logger = undefined;
const libTag = "WNS";

var Wns = function WNS(parentLogger) {
    EventEmitter.call(this);
    if (!parentLogger) {
        logger = winston({
            transports : [
                new (parentLogger.transports.Console)({
                    level       : "warn",
                    prettyPrint : true,
                    json        : true
                })
            ]
        });
    } else {
        logger = parentLogger;
    }
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
 * This function generate a XML layout for Toast or Tile notification from a JSON layout.
 *
 * @param {json|string}             data                - JSON layout.
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
 */
Wns.generatePayLoad = function (data) {
    const functionTag = "generatePayLoad";
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
    logger.log("debug", visual, { "lib" : libTag, "function" : functionTag });
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
 * @param {function}        callback                    - callback function.
 */
Wns.obtainAccessToken = function (params, callback) {
    const functionTag = "obtainAccessToken";
    var payload = url.format({
        query : {
            grant_type    : "client_credentials",
            client_id     : params.client_id,
            client_secret : params.client_secret,
            scope         : "notify.windows.com"
        }
    }).substring(1); // strip leading ?
    var options = {
        uri     : "https://login.live.com/accesstoken.srf",
        host    : "login.live.com",
        timeout : params.timeout,
        path    : "/accesstoken.srf",
        method  : "POST",
        headers : {
            "Content-Type" : "application/x-www-form-urlencoded"
        },
        body    : payload
    };
    logger.log("debug", options, { "lib" : libTag, "function" : functionTag });
    request.post(options, callback);
};

/**
 * This function send a notification to one or a group of windowsPhone devices.
 * Only Toast and Tile notification type are implemented,
 * raw type request must have their XML layout in the payload params.
 *
 * @param {object}         params                        - Function's parameters.
 *
 * @param {object}         params.payload                - Data sent in the notification
 * @see generatePayLoad
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
 * @param {function}       callback                      - callback function.
 */
Wns.prototype.send = function (params, callback) {
    const functionTag = "sendNotification";
    logger.log("debug", params, { "lib" : libTag, "function" : functionTag });
    if (!params.hasOwnProperty("payload")) {
        logger.log("error", "No notification data (payload)", { "lib" : libTag, "function" : functionTag });
        throw new Error("No notification data (payload)");
    }
    if (!params.hasOwnProperty("tokenUrl")) {
        logger.log("error", "No token URL", { "lib" : libTag, "function" : functionTag });
        throw new Error("No token URL");
    }
    if (!params.hasOwnProperty("client_id")) {
        logger.log("error", "No client ID", { "lib" : libTag, "function" : functionTag });
        throw new Error("No client ID");
    }
    if (!params.hasOwnProperty("client_secret")) {
        logger.log("error", "No client secret", { "lib" : libTag, "function" : functionTag });
        throw new Error("No client secret");
    }
    var data = params.payload;
    if (!params.hasOwnProperty("type") || !_.contains([Wns.types.TOAST, Wns.types.TILE, Wns.types.BADGE, Wns.types.RAW], params.type)) {
        data.type = Wns.types.TOAST;
        logger.log("warn", "type not set or wrong, " + data.type + " used", {
            "lib"      : libTag,
            "function" : functionTag
        });
        this.emit("warn", "[Warning: type not set or wrong, " + data.type + " used]");
    } else {
        data.type = params.type;
    }
    if (!params.hasOwnProperty("template") || !Wns.templateSpecs[params.template] && (data.type != "raw" || data.type != "badge")) {
        data.template = data.type === "toast" ? "ToastText01" : "TileSquareText04";
        logger.log("warn", "template not set or wrong, " + data.template + " used", {
            "lib"      : libTag,
            "function" : functionTag
        });
        this.emit("warn", "[Warning: template not set or wrong, " + data.template + " used]");
    } else {
        data.template = params.template;
    }
    if (data.hasOwnProperty("template")) {
        if (Wns.templateSpecs[data.template][0] < data.image.length) {
            logger.log("warn", "not all images will be used in the template", {
                "lib"      : libTag,
                "function" : functionTag
            });
            this.emit("warn", "[Warning: not all images will be used in the template]");
        }
        if (Wns.templateSpecs[data.template][0] > data.image.length) {
            logger.log("error", "Not enough images data too fill the template", {
                "lib"      : libTag,
                "function" : functionTag
            });
            throw new Error("Not enough images data too fill the template");
        }
        if (Wns.templateSpecs[data.template][1] < data.text.length) {
            logger.log("warn", "not all texts will be used in the template", {
                "lib"      : libTag,
                "function" : functionTag
            });
            this.emit("warn", "[Warning: not all texts will be used in the template]");
        }
        if (Wns.templateSpecs[data.template][1] > data.text.length) {
            logger.log("error", "Not enough texts data too fill the template", {
                "lib"      : libTag,
                "function" : functionTag
            });
            throw new Error("Not enough texts data too fill the template");
        }
    }
    if (!params.hasOwnProperty("notificationClass")) {
        logger.log("warn", "notificationClass, immediate value used", { "lib" : libTag, "function" : functionTag });
        this.emit("warn", "[Warning: notificationClass, immediate value used]");
        params.notificationClass = "immediate";
    }
    if (data.hasOwnProperty("sound") && !Wns.audioSources[data.sound]) {
        logger.log("warn", "sound not set or wrong, no sound used", { "lib" : libTag, "function" : functionTag });
        this.emit("warn", "[Warning: sound not set or wrong, no sound used]");
        delete data.sound;
    }
    logger.log("debug", data, { "lib" : libTag, "function" : functionTag });
    var payLoad = data.type === Wns.types.RAW ? params.payload : Wns.generatePayLoad(data);
    logger.log("debug", payLoad, { "lib" : libTag, "function" : functionTag });
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
    options.body = payLoad;
    Wns.obtainAccessToken({
        client_id     : params.client_id,
        client_secret : params.client_secret,
        timeout       : params.timeout
    }, function (error, response) {
        if (error) {
            logger.log("error", "Can't get an access token from microsoft : " + error, {
                "lib"      : libTag,
                "function" : functionTag
            });
            throw new Error("Can't get an access token from microsoft : " + error);
        }
        if (response.statusCode == 200) {
            var json = JSON.parse(response.body);
            options.headers["Authorization"] = "Bearer " + json["access_token"];
            var results = [];
            async.each(params.tokenUrl, function (tokenUrl, callback) {
                logger.log("debug", tokenUrl, { "lib" : libTag, "function" : functionTag });
                options.uri = tokenUrl;
                options.headers[Wns.microsoftCustomHeaderKeys.request.messageId] = Wns.UUID.generate();
                options.headers["host"] = url.parse(tokenUrl).host;
                request.post(options, function (error, response) {
                    if (error) {
                        logger.log("error", error, { "lib" : libTag, "function" : functionTag });
                        results.push({
                            error    : error,
                            tokenUrl : tokenUrl
                        });
                        this.emit("error", error);
                    } else {
                        var jsonResponse = response.toJSON();
                        logger.log("debug", jsonResponse, { "lib" : libTag, "function" : functionTag });
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
                            uri                    : jsonResponse.uri,
                            body                   : jsonResponse.body
                        };
                        if (jsonResponse.statusCode == 200) {
                            logger.log("verbose", "Notification sent to : " + tokenUrl, {
                                "lib"      : libTag,
                                "function" : functionTag
                            });
                            this.emit("transmitted", "Notification sent to " + tokenUrl);
                        } else {
                            logger.log("error", tokenUrl + " : " + result.statusCode + " : " + result.errorDescription + " " + result.responseText, {
                                "lib"      : libTag,
                                "function" : functionTag
                            });
                            this.emit("error", tokenUrl + " : " + result.statusCode + " : " + result.errorDescription + " " + result.responseText);
                        }
                        results.push(result);
                    }
                    callback();
                }.bind(this));
            }.bind(this), function (err) {
                callback(err, results)
            }.bind(this));
        } else {
            var jsonResult = response.toJSON();
            var body = JSON.parse(jsonResult.body);
            logger.log("error", "When obtaining access token : Name : " + body["error"] + ", Desc :  " + body["error_description"], {
                "lib"      : libTag,
                "function" : functionTag
            });
            callback(new Error("When obtaining access token : Name : " + body["error"] + ", Desc :  " + body["error_description"]));
        }
    }.bind(this));
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