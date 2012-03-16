var fs = require('fs'),
    path = require('path'),
    wrench = require('wrench'),
    os = require('os'),
    _self;

_self = {
    writeFile: function (fileLocation, fileName, fileData) {
        //If directory does not exist, create it.
        if (!path.existsSync(fileLocation)) {
            wrench.mkdirSyncRecursive(fileLocation, "0755");
        }

        fs.writeFile(path.join(fileLocation, fileName), fileData, function (err) {
            if (err) throw err;
        });
    },

    isWindows: function () {
        return os.type().toLowerCase().indexOf("windows") >= 0;
    },
    
    isArray: function (obj) {
        return obj.constructor.toString().indexOf("Array") !== -1;
    },
    
    toBoolean: function (myString, defaultVal) {
        // if defaultVal is not passed, default value is undefined
        return myString === "true" ? true : myString === "false" ? false : defaultVal;
    },
    
    contains: function (array, element) {
        for (var i = 0; i < array.length; i++) {
            if (array[i] === element) {
                return true;
            }
        }
            
        return false;
    },

    parseUri : function (str) {
        var i, uri = {},
            key = [ "source", "scheme", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor" ],
            matcher = /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/.exec(str);

        for (i = key.length - 1; i >= 0; i--) {
            uri[key[i]] = matcher[i] || "";
        }

        return uri;
    },

    // uri - output from parseUri
    isAbsoluteURI : function (uri) {
        if (uri && uri.source) {
            return uri.relative !== uri.source;
        }

        return false;
    },

    isLocalURI : function (uri) {
        return uri && uri.scheme && uri.scheme.toLowerCase() === "local";
    }
};

module.exports = _self;
