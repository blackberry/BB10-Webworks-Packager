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
var wrench = require("wrench"),
    utils = require("./utils"),
    _c = require("./conf"),
    fs = require("fs"),
    path = require("path");

function copyFolder(source, destination) {
    if (fs.existsSync(source)) {
        //create the destination folder if it does not exist
        if (!fs.existsSync(destination)) {
            wrench.mkdirSyncRecursive(destination, "0755");
        }

        wrench.copyDirSyncRecursive(source, destination);
    }
}

module.exports = function (buildEnv) {
    var frameworkDest = path.join(_c.DEPLOY, 'Framework/'),
        libDest = path.join(_c.DEPLOY, 'lib'),
        nodeModulesDest = path.join(_c.DEPLOY, 'node_modules'),
        thirdPartyDest = path.join(_c.DEPLOY, 'third_party'),
        toolsDest = path.join(_c.DEPLOY, 'dependencies', 'tools'),
        nodeDirDest = path.join(thirdPartyDest, 'node'),
        nodeFileLinux = path.join(nodeDirDest, 'linux', 'node'),
        nodeFileMac = path.join(nodeDirDest, 'mac', 'node'),
        nodeFileWindows = path.join(nodeDirDest, 'windows', 'node.exe'),

        //files
        bbwpFile = path.join(_c.ROOT, 'bbwp'),
        bbwpBatFile = path.join(_c.ROOT, 'bbwp.bat'),
        licenseFile = path.join(_c.ROOT, 'licenses.txt'),
        defaultIcon = path.join(_c.ROOT, 'default-icon.png'),
        readMeFile = path.join(_c.ROOT, 'README.txt'),
        paramsExampleFile = path.join(_c.ROOT, "params-example.json");

    //Copy folders to target directory
    copyFolder(_c.FRAMEWORK_DEPLOY, frameworkDest);
    copyFolder(_c.LIB, libDest);
    copyFolder(_c.NODE_MOD, nodeModulesDest);
    copyFolder(_c.THIRD_PARTY, thirdPartyDest);
    //Copy bin/lib folders for tools individually. This ensure we don't copy any extra folders that may come from BBNDK tools.
    if (_c.TOOLS && buildEnv !== "-ci" && buildEnv !== "-scm") {
        copyFolder(path.join(_c.TOOLS, "bin"), path.join(toolsDest, "bin"));
        copyFolder(path.join(_c.TOOLS, "lib"), path.join(toolsDest, "lib"));
    }

    //Copy files to target directory
    utils.copyFile(bbwpFile, _c.DEPLOY);
    utils.copyFile(bbwpBatFile, _c.DEPLOY);
    utils.copyFile(licenseFile, _c.DEPLOY);
    utils.copyFile(readMeFile, _c.DEPLOY);
    utils.copyFile(defaultIcon, _c.DEPLOY);
    utils.copyFile(paramsExampleFile, _c.DEPLOY);


    //Add execute permissions to node binaries
    fs.chmodSync(nodeFileMac, '0755');
    fs.chmodSync(nodeFileWindows, '0755');
    if (fs.existsSync(nodeFileLinux)) {
        //User included linux binary, chmod that as well
        fs.chmodSync(nodeFileLinux, '0755');
    }

    //Add execute permissions to bbwp script
    fs.chmodSync(path.join(_c.DEPLOY, "bbwp"), '0755');
    fs.chmodSync(path.join(_c.DEPLOY, "bbwp.bat"), '0755');

    if (fs.existsSync(toolsDest)) {
        //Add execute permissions to bbndk tools directory
        wrench.chmodSyncRecursive(toolsDest, '0755');
    }
};
