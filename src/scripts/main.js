/**
 * --------------------------------------------------------------------
 * Copyright 2015 Nikolay Mavrenkov
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * --------------------------------------------------------------------
 *
 * Author:  Nikolay Mavrenkov <koluch@koluch.ru>
 * Created: 01.11.2015 23:04
 */

import React from 'react'
import ReactDom from 'react-dom'
import Root from './components/Root'

// Force use https (only on production)
if(window.context.env === "PROD" && window.location.protocol === "http:") {
    window.location.href = window.location.href.replace(/^http/, "https")
}

// Fix tab button behaviour in Safari
document.addEventListener('keydown', (e) => {
    if(e.keyCode === 9) {
        var inputs = Array.prototype.slice.call(document.querySelectorAll("input, button, textarea"));
        inputs = inputs.filter((inp) => {
            if(inp.nodeName.toLowerCase() === "input" && inp.getAttribute("type") === "hidden") {
                return false
            }
            return inp.tabIndex > 0 && !inp.disabled
        })

        if(inputs.length > 0) {
            inputs = inputs.sort((x,y) => x.tabIndex - y.tabIndex)
            for(var i = 0; i < inputs.length; ++i) {
                if(inputs[i] === document.activeElement) {
                    if(i == inputs.length - 1) {
                        inputs[0].focus()
                    }
                    else {
                        inputs[i+1].focus()
                    }
                    break;
                }
            }
        }
        e.preventDefault()
        return false;
    }
});


document.addEventListener('DOMContentLoaded', () => {
    ReactDom.render(
        <Root/>,
        document.getElementById("react")
    );
});
