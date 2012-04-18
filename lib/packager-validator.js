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
    validateSession: function (session, widgetConfig) {
        //The string checks below is to get around a really weird issue in commander
        //where sometimes unspecified arguments come in as a function...
        var keysFound = session.keystore,
            keysPassword = session.storepass && typeof session.storepass === "string",
            commandLinebuildId = session.buildId && typeof session.buildId === "string",//--buildId
            buildId = widgetConfig.buildId && typeof widgetConfig.buildId === "string";//Finalized Build ID
            
        //Signing keys exist?
        if (!keysFound) {
            if (keysPassword || commandLinebuildId) {
                //If -g <password> or --buildId is set, but no keys were found, throw an error
                throw localize.translate("EXCEPTION_MISSING_SIGNING_KEYS");
            } else if (buildId) {
                //If a buildId exists in config, but no keys were found, throw a warning
                logger.warn(localize.translate("WARNING_MISSING_SIGNING_KEYS"));
            }
        }
        
        //if -g was provided with NO build id, throw error
        if (keysPassword && !buildId) {
            throw localize.translate("EXCEPTION_MISSING_SIGNING_BUILDID");
        }
        
        if (commandLinebuildId && !keysPassword) {
            //if --buildId was provided with NO password, throw error
            throw localize.translate("EXCEPTION_MISSING_SIGNING_PASSWORD");
        } else if (buildId && !keysPassword) {
            //if a buildId was provided in config.xml with NO password, throw warning
            logger.warn(localize.translate("WARNING_SIGNING_PASSWORD_EXPECTED"));
        }
    }
};

module.exports = _self;
