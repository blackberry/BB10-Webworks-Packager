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
    AUTHOR_P12 = "author.p12",
    CSK = "barsigner.csk",
    DB = "barsigner.db",
    _self;

function getDefaultPath(file) {
    // The default location where signing key files are stored will vary based on the OS:
    // Windows XP: %HOMEPATH%\Local Settings\Application Data\Research In Motion
    // Windows Vista and Windows 7: %HOMEPATH%\AppData\Local\Research In Motion
    // Mac OS: ~/Library/Research In Motion
    // UNIX or Linux: ~/.rim
    var p = "";
    if (os.type().toLowerCase().indexOf("windows") >= 0) {
        // Try Windows XP location
        p = process.env.HOMEDRIVE + process.env.HOMEPATH + "\\Local Settings\\Application Data\\Research In Motion\\" + file;
        if (path.existsSync(p)) {
            return p;
        }

        // Try Windows Vista and Windows 7 location
        p = process.env.HOMEDRIVE + process.env.HOMEPATH + "\\AppData\\Local\\Research In Motion\\" + file;
        if (path.existsSync(p)) {
            return p;
        }
    } else if (os.type().toLowerCase().indexOf("darwin") >= 0) {
        // Try Mac OS location
        p = process.env.HOME + "/Library/Research In Motion/" + file;
        if (path.existsSync(p)) {
            return p;
        }
    }
}

_self = {
    getKeyStorePath : function () {
        // Todo: decide where to put sigtool.p12 which is genereated and used in WebWorks SDK for Tablet OS
        return getDefaultPath(AUTHOR_P12);
    },
    
    getCskPath : function () {
        return getDefaultPath(CSK);
    },
    
    getDbPath : function () {
        return getDefaultPath(DB);
    }
};

module.exports = _self;
