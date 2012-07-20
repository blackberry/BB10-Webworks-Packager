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

var fs = require("fsext"),
    util = require('util'),
    xml2js = require('xml2js'),
    path = require("path"),
    packagerUtils = require('./packager-utils'),
    check = require('validator').check,
    sanitize = require('validator').sanitize,
    localize = require("./localize"),
    logger = require("./logger"),
    fileManager = require("./file-manager"),
    utils = require("./packager-utils"),
    i18nMgr = require("./i18n-manager"),
    _self;

function createAccessListObj(featuresArray, uri, allowSubDomain, extManager) {
    var accessObj = {
            features: [],
            uri: uri,
            allowSubDomain: allowSubDomain
        },
        attribs;
    if (featuresArray) {
        featuresArray.forEach(function (feature) {
            attribs = feature["@"];
            
            if (attribs) {
                attribs.required = packagerUtils.toBoolean(attribs.required, true);
            }
            accessObj.features.push(attribs);
        });
    }

    // always add global features to whitelist
    extManager.getGlobalFeatures().forEach(function (feature) {
        var featureFound = accessObj.features.reduce(function (found, currElem) {
                if (currElem) {
                    return found || currElem.id === feature.id;
                }
            }, false);
        
        if (!featureFound) {
            accessObj.features.push(feature);
        }
    });

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

function processWidgetData(data, widgetConfig, session, extManager) {
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
    
    localFeatures = createAccessListObj(featureArray, "WIDGET_LOCAL", true, extManager);
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
                    widgetConfig.accessList.push(createAccessListObj(featureArray, attribs.uri, attribs.subdomains, extManager));
                }
            }
        });
    }
}

function trim(obj) {
    return (typeof obj === "string" ? obj.trim() : obj);
}

function processSplashScreenIconSrc(data, widgetConfig, key) {
    if (data[key]) {
        widgetConfig[key] = [];

        if (!(data[key] instanceof Array)) {
            data[key] = [data[key]];
        }

        data[key].forEach(function (obj) {
            if (obj["@"]) {
                widgetConfig[key].push(obj["@"].src);
            } else {
                widgetConfig[key].push(obj);
            }
        });
    }
}

function processSplashScreenData(data, widgetConfig) {
    //
    // This takes config.xml markup in the form of:
    //
    // <rim:splash src="splash-1280x768.jpg" />
    // <rim:splash src="splash-768x1280.jpg" />
    // <rim:splash src="splash-1024x600.jpg" />
    // <rim:splash src="splash-600x1024.jpg" />
    //
    // and turns it into:
    //
    // icon: ["splash-1280x768.jpg", "splash-768x1280.jpg", "splash-1024x600.jpg", "splash-600x1024.jpg"]
    //
    // Folder-based localization now done in i18n-manager
    //
    processSplashScreenIconSrc(data, widgetConfig, "rim:splash");
}

function processIconData(data, widgetConfig, session) {
    //
    // This takes config.xml markup in the form of:
    //
    // <icon src="icon-86.png" />
    // <icon src="icon-150.png" />
    //
    // and turns it into:
    //
    // icon: ["icon-86.png", "icon-150.png"]
    //
    // Folder-based localization now done in i18n-manager
    //
    var default_icon_filename = "default-icon.png",
        default_icon_src = session.conf.DEFAULT_ICON,
        default_icon_dst = path.join(session.sourceDir, default_icon_filename);

    processSplashScreenIconSrc(data, widgetConfig, "icon");

    if (!widgetConfig.icon) {
        fs.copySync(default_icon_src, default_icon_dst);

        widgetConfig["icon"] = [];
        widgetConfig["icon"].push(default_icon_filename);
    }
}

function validateSplashScreensIcon(widgetConfig, key) {
    if (widgetConfig[key]) {
        var msg = localize.translate(key === "icon" ? "EXCEPTION_INVALID_ICON_SRC" : "EXCEPTION_INVALID_SPLASH_SRC");

        if (widgetConfig[key].length === 0) {
            // element without src attribute
            throw msg;
        } else {
            widgetConfig[key].forEach(function (src) {
                var msg2 = localize.translate(key === "icon" ? "EXCEPTION_INVALID_ICON_SRC_LOCALES" : "EXCEPTION_INVALID_SPLASH_SRC_LOCALES");

                // check that src attribute is specified and is not empty
                check(src, msg).notNull();

                // check that src attribute does not start with reserved locales folder
                src = src.replace(/\\/g, "/");
                check(src, msg2).notRegex("^" + i18nMgr.LOCALES_DIR + "\/");
            });
        }

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

function processInvokeTargetsData(data, widgetConfig) {

    if (data["rim:invoke-target"]) {
        widgetConfig["invoke-target"] = data["rim:invoke-target"];

        //If invoke-target is not an array, wrap the invoke-target in an array
        utils.wrapPropertyInArray(widgetConfig, "invoke-target");

        widgetConfig["invoke-target"].forEach(function (invokeTarget) {
            if (invokeTarget.type && !packagerUtils.isEmpty(invokeTarget.type)) {
                invokeTarget.type = invokeTarget.type.toUpperCase();
            }

            if (invokeTarget.filter) {
                utils.wrapPropertyInArray(invokeTarget, "filter");

                invokeTarget.filter.forEach(function (filter) {

                    if (filter["action"]) {
                        utils.wrapPropertyInArray(filter, "action");
                    }

                    if (filter["mime-type"]) {
                        utils.wrapPropertyInArray(filter, "mime-type");
                    }

                    if (filter["property"]) {
                        utils.wrapPropertyInArray(filter, "property");
                    }
                });
            }
        });
    }
}

function validateConfig(widgetConfig) {
    check(widgetConfig.version, localize.translate("EXCEPTION_INVALID_VERSION"))
        .notNull()
        .regex("^[0-9]{1,3}([.][0-9]{1,3}){2,3}$");
    check(widgetConfig.name, localize.translate("EXCEPTION_INVALID_NAME")).notEmpty();
    check(widgetConfig.author, localize.translate("EXCEPTION_INVALID_AUTHOR")).notNull();
    check(widgetConfig.id, localize.translate("EXCEPTION_INVALID_ID")).regex("^[a-zA-Z][a-zA-Z0-9 ]*[a-zA-Z0-9]$");

    check(widgetConfig.content, localize.translate("EXCEPTION_INVALID_CONTENT"))
        .notNull()
        .notEmpty();

    validateSplashScreensIcon(widgetConfig, "rim:splash");

    validateSplashScreensIcon(widgetConfig, "icon");

    if (widgetConfig.accessList) {
        widgetConfig.accessList.forEach(function (access) {
            if (access.uri) {
                if (access.uri !== "WIDGET_LOCAL") {
                    check(access.uri, localize.translate("EXCEPTION_INVALID_ACCESS_URI_NO_PROTOCOL", access.uri))
                        .regex("^[a-zA-Z]+:\/\/");
                    check(access.uri, localize.translate("EXCEPTION_INVALID_ACCESS_URI_NO_URN", access.uri))
                        .notRegex("^[a-zA-Z]+:\/\/$");
                }
            }
            
            if (access.features) {
                // Assert each feature has a proper ID and is not empty
                access.features.forEach(function (feature) {
                    if (!feature) {
                        throw localize.translate("EXCEPTION_INVALID_FEATURE_ID");
                    }
                    check(feature.id, localize.translate("EXCEPTION_INVALID_FEATURE_ID")).notNull().notEmpty();
                });
            }

        });
    }

    if (widgetConfig["invoke-target"]) {

        widgetConfig["invoke-target"].forEach(function (invokeTarget) {

            check(typeof invokeTarget["@"] === "undefined",
                    localize.translate("EXCEPTION_INVOKE_TARGET_INVALID_ID"))
                .equals(false);
            check(invokeTarget["@"].id, localize.translate("EXCEPTION_INVOKE_TARGET_INVALID_ID"))
                .notNull()
                .notEmpty();
            check(invokeTarget.type, localize.translate("EXCEPTION_INVOKE_TARGET_INVALID_TYPE"))
                .notNull()
                .notEmpty()
                .isIn(["APPLICATION", "VIEWER"]);

            if (invokeTarget.filter) {

                invokeTarget.filter.forEach(function (filter) {

                    check(filter["action"] && filter["action"] instanceof Array && filter["action"].length > 0,
                            localize.translate("EXCEPTION_INVOKE_TARGET_ACTION_INVALID"))
                        .equals(true);

                    check(filter["mime-type"] && filter["mime-type"] instanceof Array && filter["mime-type"].length > 0,
                            localize.translate("EXCEPTION_INVOKE_TARGET_MIME_TYPE_INVALID"))
                        .equals(true);

                    if (filter.property) {
                        filter.property.forEach(function (property) {
                            check(property["@"] && property["@"]["var"] && typeof property["@"]["var"] === "string",
                                    localize.translate("EXCEPTION_INVOKE_TARGET_FILTER_PROPERTY_INVALID"))
                                .equals(true);
                            check(property["@"]["var"], localize.translate("EXCEPTION_INVOKE_TARGET_FILTER_PROPERTY_INVALID"))
                                .isIn(["exts", "uris"]);
                        });
                    }
                });
            }
        });
    }
}

function processResult(data, session, extManager) {
    var widgetConfig = {};

    processWidgetData(data, widgetConfig, session, extManager);
    processIconData(data, widgetConfig, session);
    processAuthorData(data, widgetConfig);
    processLicenseData(data, widgetConfig);
    processContentData(data, widgetConfig);
    processOrientationData(data, widgetConfig);
    processPermissionsData(data, widgetConfig);
    processInvokeTargetsData(data, widgetConfig);
    processSplashScreenData(data, widgetConfig);

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
    parse: function (xmlPath, session, extManager, callback) {
        var fileData = fs.readFileSync(xmlPath),
            xml = utils.bufferToString(fileData),
            parser = new xml2js.Parser({trim: true, normalize: true, explicitRoot: false});

        //parse xml file data
        parser.parseString(xml, function (err, result) {
            if (err) {
                logger.error(localize.translate("EXCEPTION_PARSING_XML"));
                fileManager.cleanSource(session);
            } else {
                callback(processResult(result, session, extManager));
            }
        });
    }
};

module.exports = _self;
