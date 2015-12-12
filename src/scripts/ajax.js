"use strict";
/**
 * Copyright (c) 2015 Nikolai Mavrenkov <koluch@koluch.ru>
 *
 * Distributed under the MIT License (See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT).
 *
 * Created: 12.12.2015 23:25
 */

var nanoajax = require('nanoajax'),
    Q = require('kew');

module.exports.get = (url) => {
    var promise = new Q.defer();

    nanoajax.ajax({url: url}, (code, responseText) => {
        if (code === 200) {
            try {
              promise.resolve(JSON.parse(responseText)); //todo: check for errors
            }
            catch(e) {
              promise.reject({
                code: -1,
                responseTex: "failed to parse response as JSON: " + responseText
              });
            }
        }
        else {
            promise.reject({
                code:code,
                responseText:responseText
            });
        }
    });

    return promise;
}
