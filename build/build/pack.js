/*
* Copyright 2011 Research In Motion Limited.
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
var wrench = require("../../node_modules/wrench"),
    utils = require("./utils"),
    _c = require("./conf"),
    path = require("path");

function copyFolder(source, destination) {
    //create the destination folder if it does not exist
    if (!path.existsSync(destination)) {
        wrench.mkdirSyncRecursive(destination, "0755");
    }

    wrench.copyDirSyncRecursive(source, destination);
}

module.exports = function (src, baton) {
    var frameworkDest = path.join(_c.DEPLOY, 'Framework/'),
        libDest = path.join(_c.DEPLOY, 'lib'),
        nodeModulesDest = path.join(_c.DEPLOY, 'node_modules'),
        
        //files
        bbwpFile = path.join(_c.ROOT, 'bbwp'),
        bbwpBatFile = path.join(_c.ROOT, 'bbwp.bat'),
        licenseFile = path.join(_c.ROOT, 'licenses.txt'),
        defaultIcon = path.join(_c.ROOT, 'default-icon.png');

    //Copy folders to target directory
    copyFolder(_c.FRAMEWORK_DEPLOY, frameworkDest);
    copyFolder(_c.LIB, libDest);
    copyFolder(_c.NODE_MOD, nodeModulesDest);
    
    //Copy files to target directory
    utils.copyFile(bbwpFile, _c.DEPLOY);
    utils.copyFile(bbwpBatFile, _c.DEPLOY);
    utils.copyFile(licenseFile, _c.DEPLOY);
    utils.copyFile(defaultIcon, _c.DEPLOY);
};
