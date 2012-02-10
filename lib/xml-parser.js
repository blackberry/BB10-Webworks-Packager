var fs = require('fs'),
    util = require('util'),
    xml2js = require('xml2js'),
    packager_utils = require('./packager-utils'),
    parser = new xml2js.Parser({trim: true, normalize: true, explicitRoot: false}),
    widgetConfig = {},
    _self;

function populateConfigObject(result) {
    widgetConfig.name = result.name;
    widgetConfig.author = result.author;
    widgetConfig.license = result.license["#"];
    widgetConfig.content = result.content["@"].src;
    widgetConfig.version = result["@"].version;
    widgetConfig.foregroundSource = "local:///chrome/startPage.html";
    widgetConfig.description = result.description;
    widgetConfig.icon = result.icon["@"].src;
    widgetConfig.configXML = "config.xml";
    widgetConfig.hasMultiAccess = true;
    widgetConfig.licenseURL = result.license["@"].href;
    widgetConfig.accessList = [
        {
            "allowSubDomain": true,
            "features": [],
            "uri": "WIDGET_LOCAL"
        }
    ];
    
    for (var i = 0 ;  i < result.feature.length; i++) {
        widgetConfig.accessList[0].features.push(result.feature[i]['@']);
    }
}

_self = {
    parse: function (xmlPath, callback) {
        var fileData = fs.readFileSync(xmlPath);
        
        //parse xml file data
        parser.parseString(fileData, function (err, result) {
            populateConfigObject(result);
            callback(widgetConfig);
        });
    }
};

module.exports = _self;