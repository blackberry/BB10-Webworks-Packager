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

var childProcess = require("child_process"),
    fs = require("fs"),
    path = require("path"),
    util = require("util"),
    data2xml = require("data2xml"),
    wrench = require("wrench"),
    conf = require("./conf"),
    logger = require("./logger"),
    localize = require("./localize"),
    pkgrUtils = require("./packager-utils"),
    NL = pkgrUtils.isWindows() ? "\r\n" : "\n";
    
function generateTabletXMLFile(session, config) {
    var files = wrench.readdirSyncRecursive(session.sourceDir),
        xmlObject = {
            id : config.id,
            name : config.name,
            versionNumber : config.version,
            author : config.author,
            asset : [{
                _attr : { entry : 'true', type : 'qnx/elf' },
                _value : 'wwe'
            }],
            initialWindow : {
                systemChrome : 'none',
                transparent : 'true'
            },
            env : {
                _attr : { value : '12', var : 'WEBKIT_NUMBER_OF_BACKINGSTORE_TILES'}
            },
            permission : {
                _attr : { system : 'true'},
                _value : 'run_native'
            }
        };
        
    //buildId
    if (config.buildId) {
        xmlObject.buildId = config.buildId;
    }
    
    if (files) {
        files.forEach(function (file) {
            file = path.resolve(session.sourceDir, file);

            if (file.indexOf("blackberry-tablet.xml") < 0 && !fs.statSync(file).isDirectory()) {
                file = file.replace(/\\/g, "/");
                file = file.split("src/")[1];
                
                if (path.extname(file) === ".so") {
                    xmlObject.asset.push({
                        _attr : { type : 'qnx/elf' },
                        _value : file
                    });
                } else {
                    xmlObject.asset.push({
                        _value : file
                    });
                }
            }
        });
    }
    
    //Add description element if specifed
    if (config.description) {
        xmlObject.description = config.description;
    }

    //Add icon element if specified
    if (config.icon) {
        xmlObject.icon = {
            image: config.icon
        };
    }
    
    //Add permissions
    if (config.permissions) {
        xmlObject.action = config.permissions;
    }

    pkgrUtils.writeFile(session.sourceDir, "blackberry-tablet.xml", data2xml('qnx', xmlObject));
}

function generateOptionsFile(session, target) {
    var srcFiles = wrench.readdirSyncRecursive(session.sourceDir),
        optionsStr = "-package" + NL,
        debugToken;
        
    if (session.debug) {
        if (path.extname(conf.DEBUG_TOKEN) === ".bar") {
            if (path.existsSync(conf.DEBUG_TOKEN)) {
                debugToken = "-debugToken" + NL;
                debugToken += conf.DEBUG_TOKEN + NL;
            }
            else {
                logger.warn(localize.translate("EXCEPTION_DEBUG_TOKEN_NOT_FOUND"));
            }
        } else {
            logger.warn(localize.translate("EXCEPTION_DEBUG_TOKEN_WRONG_FILE_EXTENSION"));
        }
    }
    
    //TODO add logic to use proper buildId (i.e. -buildId or 4rth octet in version)
    //getBuildId();
    
    //Signing params
    if (target === "device" && session.keystore && session.storepass && session.buildId) {
        optionsStr += "-sign" + NL;
        optionsStr += "-keystore" + NL;
        optionsStr += session.keystore + NL;
        optionsStr += "-storepass" + NL;
        optionsStr += session.storepass + NL;
        optionsStr += "-buildId" + NL;
        optionsStr += session.buildId + NL;
    }
    
    optionsStr += path.resolve(util.format(session.barPath, target)) + NL;
    optionsStr += "-C" + NL;
    optionsStr += session.sourceDir + NL;
    optionsStr += (session.debug ? ("-devMode" + NL) : "");
    optionsStr += (debugToken ? debugToken : "");
    optionsStr += "blackberry-tablet.xml" + NL;

    srcFiles.forEach(function (file) {
        file = path.resolve(session.sourceDir, file);

        if (file.indexOf("blackberry-tablet.xml") < 0 && !fs.statSync(file).isDirectory()) {
            optionsStr += file + NL;
        }
    });

    fs.writeFileSync(path.normalize(session.sourceDir + "/options"), optionsStr);
}

function execNativePackager(session, callback) {
    var script = "/bin/blackberry-nativepackager",
        cwd = session.sourceDir,
        nativePkgr,
        msg;

    if (pkgrUtils.isWindows()) {
        script += ".bat";
    }

    nativePkgr = childProcess.spawn(path.normalize(conf.DEPENDENCIES_TOOLS + script), ["@options"], {
        "cwd": cwd,
        "env": process.env
    });

    nativePkgr.stdout.on("data", function (data) {
        msg = data.toString();
        
        if (msg.toLowerCase().indexOf("error:") >= 0) {
            logger.error(msg);
        } else {
            logger.info(msg);
        }
    });

    nativePkgr.stderr.on("data", function (data) {
        msg = data.toString();

        if (msg.toLowerCase().indexOf("warn") >= 0) {
            logger.warn(msg);
        } else {
            logger.error(msg);
        }
    });

    nativePkgr.on("exit", function (code) {
        if (callback && typeof callback === "function") {
            callback(code);
        }
    });
}

module.exports = {
    exec: function (session, target, config, callback) {
        generateOptionsFile(session, target);
        generateTabletXMLFile(session, config);
        execNativePackager(session, callback);
    }
};
