"use strict";
/**
 * Copyright (c) 2015 Nikolai Mavrenkov <koluch@koluch.ru>
 *
 * Distributed under the MIT License (See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT).
 *
 * Created: 12.12.2015 23:25
 */
var Promise = require('es6-promise').Promise

export const get = (url, props = {}) => {
    let xmlhttp;

    return new Promise((resolve, reject) => {

        if (window.XMLHttpRequest) {
            // code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp = new XMLHttpRequest();
        } else {
            // code for IE6, IE5
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }

        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
                if(xmlhttp.status == 200){
                    if(xmlhttp.responseText) {
                        try {
                            resolve(JSON.parse(xmlhttp.responseText));
                        }
                        catch(e) {
                            console.error("Response text is not null, but it's not a valid JSON: " + xmlhttp.responseText)
                            resolve(null);
                        }
                    }
                    else {
                        resolve(null);
                    }
                }
                else {
                    reject({
                        code: xmlhttp.status,
                        responseText: xmlhttp.responseText
                    })
                }
            }
        }

        xmlhttp.withCredentials = props.withCredentials !== false;
        xmlhttp.open("GET", url, true);
        xmlhttp.send();
    })


}

export const post = (url, body) => {
    return new Promise((resolve, reject) => {

        let xmlhttp;

        if (window.XMLHttpRequest) {
            // code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp = new XMLHttpRequest();
        } else {
            // code for IE6, IE5
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }

        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
                if(xmlhttp.status == 200){
                    if(xmlhttp.responseText) {
                        try {
                            resolve(JSON.parse(xmlhttp.responseText));
                        }
                        catch(e) {
                            console.error("Response text is not null, but it's not a valid JSON: " + xmlhttp.responseText)
                            resolve(null);
                        }
                    }
                    else {
                        resolve(null);
                    }
                }
                else {
                    reject({
                        code: xmlhttp.status,
                        responseText: xmlhttp.responseText
                    })
                }
            }
        }

        xmlhttp.withCredentials = true;
        xmlhttp.open("POST", url, true);
        xmlhttp.send(JSON.stringify(body));

    })
}