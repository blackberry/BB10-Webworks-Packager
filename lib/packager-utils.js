var fs = require('fs'),
    path = require('path'),
    wrench = require('wrench'),
    os = require('os'),
    _self;

function swapBytes(buffer) {
    var l = buffer.length,
        i,
        a;

    if (l % 2 === 0x01) {
        throw new Error('Buffer length must be even');
    }

    for (i = 0; i < l; i += 2) {
        a = buffer[i];
        buffer[i] = buffer[i + 1];
        buffer[i + 1] = a;
    }

    return buffer;
}

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
    },

    // Convert node.js Buffer data (encoded) to String
    bufferToString : function (data) {
        var s = "";
        if (Buffer.isBuffer(data)) {
            if (data.length >= 2 && data[0] === 0xFF && data[1] === 0xFE) {
                s = data.toString("ucs2", 2);
                console.log("bufferToString: " + s);
            } else if (data.length >= 2 && data[0] === 0xFE && data[1] === 0xFF) {
                try {
                    swapBytes(data);
                    s = data.toString("ucs2", 2);
                } catch (e) {
                    console.log("ERROR in bufferToString(): " + e.message);
                }
            } else if (data.length >= 3 && data[0] === 0xEF && data[1] === 0xBB && data[2] === 0xBF) {
                s = data.toString("utf8", 3);
            } else {
                s = data.toString("ascii");
            }
        }

        return s;
    },
};

module.exports = _self;
