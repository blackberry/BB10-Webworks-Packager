var fs = require('fs'),
    util = require('util'),
    xml2js = require('xml2js'),
    packagerUtils = require('./packager-utils'),
    check = require('validator').check,
    sanitize = require('validator').sanitize,
    parser = new xml2js.Parser({trim: true, normalize: true, explicitRoot: false}),
    localize = require("./localize"),
    logger = require("./logger"),
    _self;

function createAccessListObj(featuresArray, uri, allowSubDomain) {
    //if allowSubDomain is a string,convert to boolean
    if (typeof allowSubDomain === "string") {
        allowSubDomain = !!allowSubDomain;
    }

    var accessObj = {
            features: [],
            uri: uri,
            allowSubDomain: allowSubDomain
        },
        attribs;

    if (featuresArray) {
        featuresArray.forEach(function (feature) {
            attribs = feature["@"];

            //Convert required field to boolean
            attribs.required = attribs.required === "false" ? false : true;

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

        widgetConfig.author = sanitize(data.author).trim();

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
        var attribs  = data.content["@"];
        if (attribs) {
            widgetConfig.content = attribs.src;
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

function validateConfig(widgetConfig) {
    check(widgetConfig.version, localize.translate("EXCEPTION_INVALID_VERSION"))
        .notNull()
        .regex("(\\d{1,3})(?:\\.(\\d{1,3}))(?:\\.(\\d{1,3}))(?:\\.(\\d{1,3}))?$");
    check(widgetConfig.name, localize.translate("EXCEPTION_INVALID_NAME")).notEmpty();
    check(widgetConfig.author, localize.translate("EXCEPTION_INVALID_AUTHOR")).notNull();

    if (widgetConfig.id) {
        check(widgetConfig.id, localize.translate("EXCEPTION_INVALID_ID")).regex("[a-zA-Z][a-zA-Z0-9]*");
    }

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

    widgetConfig.name = data.name;
    widgetConfig.description = data.description;
    widgetConfig.permissions = data["rim:permissions"];
    widgetConfig.configXML = "config.xml";

    //validate the widgetConfig
    validateConfig(widgetConfig);

    return widgetConfig;
}

_self = {
    parse: function (xmlPath, callback) {
        var fileData = fs.readFileSync(xmlPath);

        //parse xml file data
        parser.parseString(fileData, function (err, result) {
            if (err) {
                logger.error(localize.translate("EXCEPTION_PARSING_XML"));
            } else {
                callback(processResult(result));
            }
        });
    }
};

module.exports = _self;