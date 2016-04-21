/**
 * Created by yoann on 21/04/16.
 */

module.exports = {
    /**
     * Slice an array in a chuck of length.
     * @param           {Array}         array array to slice
     * @param           {int}           length length of the result chunk
     * @returns         {Array}         array of chunk
     */
    chunk : function (array, length) {
        var chunks = [],
            i = 0,
            n = array.length;
        while (i < n) {
            chunks.push(array.slice(i, i += length));
        }
        return chunks;
    }
};