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
var check = require('validator').check,
    sanitize = require('validator').sanitize,
    localize = require("./localize"),
    logger = require("./logger"),
    signingHelper = require("./signing-helper"),
    _self;
    
//NOTE this class is unfinished and is a work in progress
    
_self = {
    //TODO create one global validate method that will validate
    //both the session and configObj?
    validateSession: function (session) {
        //If -g <password> is set, but no keys were found, throw an error
        //The string check is to get around a really weird issue in commander
        //where when -g is not provided, the storepass comes in as a function...
        if (session.storepass && typeof session.storepass === "string" && !session.keystore) {
            throw localize.translate("EXCEPTION_MISSING_SIGNING_KEYS");
        }
    }
};

module.exports = _self;
