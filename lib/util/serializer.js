/**
 * Created by yoann on 19/04/16.
 */
var extend = require('util')._extend;

/**
 * Serializers for Bunyan logger.
 */
module.exports = {
    /**
     * frame's data encrypted, not really useful and take a lot of space, so removed.
     * @param frame
     * @returns {*}
     */
    frameSerializer : function frameSerializer(frame) {
        tmp = extend({}, frame);
        if (tmp.hasOwnProperty('data')) {
            delete tmp.data;
        }
        return tmp;
    },
    /**
     * serial's data are not really useful, so worth it to inhibit it.
     * @returns {null}
     */
    streamSerializer : function streamSerializer() {
        return null;
    },

    /**
     * params.log's data are not really useful, so worth it to inhibit it.
     * @param params
     * @returns {null}
     */
    paramsSerializer : function paramsSerializer(params) {
        tmp = extend({}, params);
        if (tmp.hasOwnProperty('log')) {
            delete tmp.log;
        }
        return tmp;
    }
};