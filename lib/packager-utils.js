var fs = require('fs'),
    path = require('path'),
    wrench = require('wrench'),
    _self;

_self = {
    writeFile: function(fileLocation, fileName, fileData){        
        //If directory does not exist, create it.
        if (!path.existsSync(fileLocation)){
            wrench.mkdirSyncRecursive(fileLocation, 0777);
        }
        
        fs.writeFile(path.join(fileLocation, fileName), fileData, function (err) {
            if (err) throw err;
        });
    }
};

module.exports = _self;