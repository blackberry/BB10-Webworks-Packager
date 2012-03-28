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

function processWidgetData(data, widgetConfig) {
    var localFeatures, attribs;

    if (data["@"]) {
        widgetConfig.version = data["@"].version;
        widgetConfig.id = data["@"].id;
    }

    widgetConfig.hasMultiAccess = true;//Implement properly
    widgetConfig.accessList = [];

    if (data.feature) {
        //add locally available features to access list
        localFeatures = createAccessListObj(packagerUtils.isArray(data.feature) ? data.feature : [data.feature], "WIDGET_LOCAL", true);
        widgetConfig.accessList.push(localFeatures);
    }

    //add whitelisted features to access list
    if (data.access) {
        //If there is only one access list element, it will be parsed as an object and not an array
        if (!packagerUtils.isArray(data.access)) {
            data.access = [data.access];
        }

        data.access.forEach(function (accessElement) {
            attribs = accessElement["@"];

            if (attribs) {
                attribs.subdomains = packagerUtils.toBoolean(attribs.subdomains);
                widgetConfig.accessList.push(createAccessListObj(accessElement.feature, attribs.uri, attribs.subdomains));
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

        if (!attribs) {
            widgetConfig.author = sanitize(data.author).trim();
        } else if (data.author["#"]) {
            widgetConfig.author = sanitize(data.author["#"]).trim();
        }

        if (attribs) {
            widgetConfig.authorURL = attribs.href;
            widgetConfig.copyRight = attribs["rim:copyright"];
            widgetConfig.authorEmail = attribs.email;
        }
    }
}

function processLicenseData(data, widgetConfig) {
    if (data.license && data.license["#"]) {
        widgetConfig.license = data.license["#"];

        if (data.license["@"]) {
            widgetConfig.licenseURL = data.license["@"].href;
        }
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
}

function validateConfig(widgetConfig) {
    check(widgetConfig.version, localize.translate("EXCEPTION_INVALID_VERSION"))
        .notNull()
        .regex("(\\d{1,3})(?:\\.(\\d{1,3}))(?:\\.(\\d{1,3}))(?:\\.(\\d{1,3}))?$");
    check(widgetConfig.name, localize.translate("EXCEPTION_INVALID_NAME")).notEmpty();
    check(widgetConfig.author, localize.translate("EXCEPTION_INVALID_AUTHOR")).notNull();
    check(widgetConfig.id, localize.translate("EXCEPTION_INVALID_ID")).regex("[a-zA-Z][a-zA-Z0-9]*");

    if (widgetConfig.icon) {
        check(widgetConfig.icon, localize.translate("EXCEPTION_INVALID_ICON_SRC")).notNull();
    }
}

function processResult(data) {
    var widgetConfig = {};

    processWidgetData(data, widgetConfig);
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
                callback(processResult(result));
            }
        });
    }
};

module.exports = _self;
