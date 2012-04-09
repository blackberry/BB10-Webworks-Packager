/*
 *  Copyright 2012 Research In Motion Limited.
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
 */ 
var path = require('path'),
    os = require('os'),
    authorP12 = "author.p12",
    _self;

function getKeyStoreDefaultPath() {
    // The default location where keystore is will vary based on the OS:
    // Windows XP: %HOMEPATH%\Local Settings\Application Data\Research In Motion
    // Windows Vista and Windows 7: %HOMEPATH%\AppData\Local\Research In Motion
    // Mac OS: ~/Library/Research In Motion
    // UNIX or Linux: ~/.rim
    var p = "";
    if (os.type().toLowerCase().indexOf("windows") >= 0) {
        // Try Windows XP location
        p = process.env.HOMEPATH + "\\Local Settings\\Application Data\\Research In Motion\\" + authorP12;
        if (path.existsSync(p)) {
            return p;
        }

        // Try Windows Vista and Windows 7 location
        p = process.env.HOMEPATH + "\\AppData\\Local\\Research In Motion\\" + authorP12;
        if (path.existsSync(p)) {
            return p;
        }
    } else if (os.type().toLowerCase().indexOf("darwin") >= 0) {
        // Try Mac OS location
        p = "~/Library/Research In Motion/" + authorP12;
        if (path.existsSync(p)) {
            return p;
        }
    }
}

_self = {
    getKeyStorePath : function () {
        // Todo: decide where to put sigtool.p12 which is genereated and used in WebWorks SDK for Tablet OS
        return getKeyStoreDefaultPath();
    }
};

module.exports = _self;
