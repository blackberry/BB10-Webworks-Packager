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
    }
};

module.exports = _self;