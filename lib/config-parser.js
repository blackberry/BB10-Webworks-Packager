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

var fs = require('fs'),
    util = require('util'),
    xml2js = require('xml2js'),
    packagerUtils = require('./packager-utils'),
    check = require('validator').check,
    sanitize = require('validator').sanitize,
    localize = require("./localize"),
    logger = require("./logger"),
    fileManager = require("./file-manager"),
    utils = require("./packager-utils"),
    _self;

function createAccessListObj(featuresArray, uri, allowSubDomain) {
    var accessObj = {
            features: [],
            uri: uri,
            allowSubDomain: allowSubDomain
        },
        attribs;

    if (featuresArray) {
        featuresArray.forEach(function (feature) {
            attribs = feature["@"];

            attribs.required = packagerUtils.toBoolean(attribs.required, true);

            accessObj.features.push(attribs);
        });
    }

    return accessObj;
}

function processVersion(widgetConfig) {
    if (widgetConfig.version) {
        var versionArray = widgetConfig.version.split(".");
        
        //if 4rth number in version exists, extract for build id
        if (versionArray.length > 3) {
            widgetConfig.buildId = versionArray[3];
            widgetConfig.version = widgetConfig.version.substring(0, widgetConfig.version.lastIndexOf('.'));
        }
    }
}

function processBuildID(widgetConfig, session) {
    if (session.buildId) {
        //user specified a build id (--buildId), overide any previously set build id
        widgetConfig.buildId = session.buildId;
    }
}

function processWidgetData(data, widgetConfig, session) {
    var localFeatures, attribs, featureArray;

    if (data["@"]) {
        widgetConfig.version = data["@"].version;
        widgetConfig.id = data["@"].id;
    }

    widgetConfig.hasMultiAccess = false; // Default value of hasMultiAccess is false
    widgetConfig.accessList = [];

    
    //set locally available features to access list
    if (data.feature) {
        featureArray = packagerUtils.isArray(data.feature) ? data.feature : [data.feature];
    }
    
    localFeatures = createAccessListObj(featureArray, "WIDGET_LOCAL", true);
    widgetConfig.accessList.push(localFeatures);

    //add whitelisted features to access list
    if (data.access) {
        //If there is only one access list element, it will be parsed as an object and not an array
        if (!packagerUtils.isArray(data.access)) {
            data.access = [data.access];
        }

        data.access.forEach(function (accessElement) {
            attribs = accessElement["@"];

            if (attribs) {
                if (attribs.uri === "*") {
                    if (accessElement.feature) {
                        throw localize.translate("EXCEPTION_FEATURE_DEFINED_WITH_WILDCARD_ACCESS_URI"); 
                    }
                    
                    widgetConfig.hasMultiAccess = true;
                } else {
                    //set features for this access list
                    if (accessElement.feature) {
                        featureArray = packagerUtils.isArray(accessElement.feature) ? accessElement.feature : [accessElement.feature];
                    } else {
                        featureArray = undefined;
                    }

                    attribs.subdomains = packagerUtils.toBoolean(attribs.subdomains);
                    widgetConfig.accessList.push(createAccessListObj(featureArray, attribs.uri, attribs.subdomains));
                }
            }
        });
    }
}

function processIconData(data, widgetConfig) {
    if (data.icon && data.icon["@"]) {
        widgetConfig.icon = data.icon["@"].src;
    }
}

function processAuthorData(data, widgetConfig) {
    if (data.author) {
        var attribs = data.author["@"];

        if (!attribs && typeof data.author === "string") {
            //do not sanitize empty objects {} (must be string)
            widgetConfig.author = sanitize(data.author).trim();
        } else if (data.author["#"]) {
            widgetConfig.author = sanitize(data.author["#"]).trim();
        }

        if (attribs) {
            widgetConfig.authorURL = attribs.href;
            widgetConfig.copyright = attribs["rim:copyright"];
            widgetConfig.authorEmail = attribs.email;
        }
    }
}

function processLicenseData(data, widgetConfig) {
    if (data.license && data.license["#"]) {
        widgetConfig.license = data.license["#"];
    } else {
        widgetConfig.license = "";
    }

    if (data.license && data.license["@"]) {
        widgetConfig.licenseURL = data.license["@"].href;
    } else {
        widgetConfig.licenseURL = "";
    }
}

function processContentData(data, widgetConfig) {
    if (data.content) {
        var attribs  = data.content["@"],
            startPage;

        if (attribs) {
            widgetConfig.content = attribs.src;

            startPage = packagerUtils.parseUri(attribs.src);

            // if start page is local but does not start with local:///, will prepend it
            // replace any backslash with forward slash
            if (!packagerUtils.isAbsoluteURI(startPage) && !packagerUtils.isLocalURI(startPage)) {
                if (!startPage.relative.match(/^\//)) {
                    widgetConfig.content = "local:///" + startPage.relative.replace(/\\/g, "/");
                } else {
                    widgetConfig.content = "local://" + startPage.relative.replace(/\\/g, "/");
                }
            }

            widgetConfig.foregroundSource = attribs.src;
            widgetConfig.contentType = attribs.type;
            widgetConfig.contentCharSet = attribs.charset;
            widgetConfig.allowInvokeParams = attribs["rim:allowInvokeParams"];
            //TODO content rim:background
        }
    }
}

function processOrientationData(data, widgetConfig) {
    if (data["rim:orientation"]) {
        var mode = data["rim:orientation"].mode;

        if (mode === "landscape" || mode === "portrait") {
            widgetConfig.autoOrientation = false;
            widgetConfig.orientation = mode;
            return;
        }
    }

    //Default value
    widgetConfig.autoOrientation = true;
}

function processPermissionsData(data, widgetConfig) {
    if (data["rim:permissions"] && data["rim:permissions"]["rim:permit"]) {
        var permissions = data["rim:permissions"]["rim:permit"];
        
        if (permissions instanceof Array) {
            widgetConfig.permissions = permissions;
        } else {
            //user entered one permission and it comes in as an object
            widgetConfig.permissions = [permissions];
        }
    } else {
        widgetConfig.permissions = [];
    }
    
    // hardcoded access_internet to ensure user has internet (whitelist takes care of security)
    if (widgetConfig.permissions.indexOf("access_internet") === -1) {
        widgetConfig.permissions.push("access_internet");
    }
    
    //Remove any empty permission elements
    widgetConfig.permissions = widgetConfig.permissions.filter(function (val) {
        return typeof val === "string";
    });
}

function validateConfig(widgetConfig) {
    check(widgetConfig.version, localize.translate("EXCEPTION_INVALID_VERSION"))
        .notNull()
        .regex("^[0-9]{1,3}([.][0-9]{1,3}){2,3}$");
    check(widgetConfig.name, localize.translate("EXCEPTION_INVALID_NAME")).notEmpty();
    check(widgetConfig.author, localize.translate("EXCEPTION_INVALID_AUTHOR")).notNull();
    check(widgetConfig.id, localize.translate("EXCEPTION_INVALID_ID")).regex("^[a-zA-Z][a-zA-Z0-9 ]*[a-zA-Z0-9]$");

    if (widgetConfig.icon) {
        check(widgetConfig.icon, localize.translate("EXCEPTION_INVALID_ICON_SRC")).notNull();
    }
}

function processResult(data, session) {
    var widgetConfig = {};

    processWidgetData(data, widgetConfig, session);
    processIconData(data, widgetConfig);
    processAuthorData(data, widgetConfig);
    processLicenseData(data, widgetConfig);
    processContentData(data, widgetConfig);
    processOrientationData(data, widgetConfig);
    processPermissionsData(data, widgetConfig);

    widgetConfig.name = data.name;
    widgetConfig.description = data.description;
    widgetConfig.configXML = "config.xml";

    //validate the widgetConfig
    validateConfig(widgetConfig);
    
    //special handling for version and grabbing the buildId if specified (4rth number)
    processVersion(widgetConfig);
    
    //if --buildId was specified, it takes precedence
    processBuildID(widgetConfig, session);

    return widgetConfig;
}

_self = {
    parse: function (xmlPath, session, callback) {
        var fileData = fs.readFileSync(xmlPath),
            xml = utils.bufferToString(fileData),
            parser = new xml2js.Parser({trim: true, normalize: true, explicitRoot: false});

        //parse xml file data
        parser.parseString(xml, function (err, result) {
            if (err) {
                logger.error(localize.translate("EXCEPTION_PARSING_XML"));
                fileManager.cleanSource(session);
            } else {
                callback(processResult(result, session));
            }
        });
    }
};

module.exports = _self;
