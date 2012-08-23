/*
 * $Id: base64.js,v 1.7 2012/08/23 10:30:18 dankogai Exp dankogai $
 *
 *  Licensed under the MIT license.
 *  http://www.opensource.org/licenses/mit-license.php
 *
 *  References:
 *    http://en.wikipedia.org/wiki/Base64
 */

(function(global) {

var b64chars
    = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
var b64tab = function(bin) {
    var t = {};
    for (var i = 0, l = bin.length; i < l; i++) t[bin.charAt(i)] = i;
    return t;
}(b64chars);

var cb_utob = function(c) {
    var cc = c.charCodeAt(0);
    return cc < 0x80 ? c
        : cc < 0x800 ? String.fromCharCode(0xc0 | (cc >>> 6))
                     + String.fromCharCode(0x80 | (cc & 0x3f))
        : String.fromCharCode(0xe0 | ((cc >>> 12) & 0x0f))
        + String.fromCharCode(0x80 | ((cc >>> 6) & 0x3f))
        + String.fromCharCode(0x80 | (cc & 0x3f));
};
var utob = function(u) {
    return u.replace(/[^\x00-\x7F]/g, cb_utob);
};
var cb_encode = function(ccc) {
    var padlen = [0, 2, 1][ccc.length % 3],
        ord = ccc.charCodeAt(0) << 16
            | ((ccc.length > 1 ? ccc.charCodeAt(1) : 0) << 8)
            | ((ccc.length > 2 ? ccc.charCodeAt(2) : 0)),
        chars = [
            b64chars.charAt(ord >> 18),
            b64chars.charAt((ord >> 12) & 63),
            padlen >= 2 ? '=' : b64chars.charAt((ord >> 6) & 63),
            padlen >= 1 ? '=' : b64chars.charAt(ord & 63)
        ];
    return chars.join('');
};
var btoa = global.btoa || function(b) {
    return b.replace(/[\s\S]{1,3}/g, cb_encode);
};
var encode = function(u, urisafe) {
    var result = btoa(utob(u));
    return !urisafe ? result
                    : result.replace(/[+\/]/g, function(m0) {
                        return m0 == '+' ? '-' : '_';
                    });

};

var re_btou = /[\x00-\x7f]|[\xC0-\xDF][\x80-\xBF]|[\xE0-\xEF][\x80-\xBF]{2}/g;
var cb_btou = function(ccc) {
    return String.fromCharCode(
            ccc.length < 2 ? ccc.charCodeAt(0)
        : ccc.length < 3 ? ((0x1f & ccc.charCodeAt(0)) << 6)
                                | (0x3f & ccc.charCodeAt(1))
        : ((0x0f & ccc.charCodeAt(0)) << 12)
                                | ((0x3f & ccc.charCodeAt(1)) << 6)
                                | (0x3f & ccc.charCodeAt(2))

    );
};
var btou = function(b) {
    return b.replace(re_btou, cb_btou);
};
var cb_decode = function(cccc) {
    var padlen = cccc.length % 4,
        n = ((cccc.length > 0 ? b64tab[cccc.charAt(0)] : 0) << 18)
          | ((cccc.length > 1 ? b64tab[cccc.charAt(1)] : 0) << 12)
          | ((cccc.length > 2 ? b64tab[cccc.charAt(2)] : 0) << 6)
          | ((cccc.length > 3 ? b64tab[cccc.charAt(3)] : 0)),
        chars = [
            String.fromCharCode(n >> 16),
            String.fromCharCode((n >> 8) & 0xff),
            String.fromCharCode(n & 0xff)
        ];
    chars.length -= [0, 0, 2, 1][padlen];
    return chars.join('');
};
var atob = global.atob || function(a){
    return a.replace(/[\s\S]{1,4}/g, cb_decode);
};
var decode = function(a) {
    return btou(atob(
            a.replace(/[-_]/g, function(m0) {
                return m0 == '-' ? '+' : '/';
            })
            .replace(/[^A-Za-z0-9\+\/]/g, '')
        )
    );
};

global.Base64 = {
    atob: atob,
    btoa: btoa,
    fromBase64: decode,
    toBase64: encode,
    utob: utob,
    encode: encode,
    encodeURI: function(u) { return encode(u, true) },
    btou: btou,
    decode: decode
};

})(this);