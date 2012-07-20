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

var path = require("path"),
    util = require("util"),
    packager_utils = require("./packager-utils"),
    fs = require("fsext"),
    wrench = require("wrench"),
    zip = require("zip"),
    localize = require("./localize"),
    logger = require("./logger"),
    CLIENT_JS = "client.js",
    SERVER_JS = "index.js",
    VALID_EXTENSIONS = [".js", ".json"];

function unzip(from, to) {
    var data, entries, p, parent;

    if (path.existsSync(from)) {
        data = fs.readFileSync(from);
        entries = zip.Reader(data).toObject();

        if (!path.existsSync(to)) {
            wrench.mkdirSyncRecursive(to, "0755");
        }

        for (p in entries) {
            if (p.indexOf("__MACOSX") >= 0) {
                continue;
            }

            if (p.split("/").length > 1) {
                parent = p.split("/").slice(0, -1).join("/");
                wrench.mkdirSyncRecursive(to + "/" + parent, "0755");
            }

            fs.writeFileSync(to + "/" + p, entries[p]);
        }
    } else {
        throw localize.translate("EXCEPTION_WIDGET_ARCHIVE_NOT_FOUND", from);
    }
}

function prepare(session) {
    var conf = session.conf,
        dest = session.sourcePaths;

    if (path.existsSync(session.sourceDir)) {
        wrench.rmdirSyncRecursive(session.sourceDir);
    }

    if (!path.existsSync(dest.CHROME)) {
        wrench.mkdirSyncRecursive(dest.CHROME, "0755");
    }

    // copy bootstrap
    wrench.copyDirSyncRecursive(conf.DEPENDENCIES_BOOTSTRAP, dest.CHROME);

    if (!path.existsSync(dest.LIB)) {
        wrench.mkdirSyncRecursive(dest.LIB, "0755");
    }

    // copy framework
    wrench.copyDirSyncRecursive(conf.LIB, dest.LIB);
    wrench.copyDirSyncRecursive(conf.UI, dest.UI);

    // unzip archive
    unzip(session.archivePath, session.sourceDir);
}


function getModulesArray(dest, files, baseDir) {
    var modulesList = [],
        EXCLUDE_FILES = ["client.js", "manifest.json"];

    function isExcluded(file) {
        return EXCLUDE_FILES.some(function (element) {
            return path.basename(file) === element;
        });
    }

    files.forEach(function (file) {
        file = path.resolve(baseDir, file);

        if (!fs.statSync(file).isDirectory()) {
            if (baseDir !== dest.EXT || !isExcluded(file)) {
                modulesList.push(path.relative(path.normalize(dest.CHROME), file).replace(/\\/g, "/"));
            }
        }
    });

    return modulesList;
}

function generateFrameworkModulesJS(session) {
    var dest = session.sourcePaths,
        modulesList = [],
        modulesStr = "var frameworkModules = ",
        libFiles = wrench.readdirSyncRecursive(dest.LIB),
        extFiles,
        extModules;

    modulesList = modulesList.concat(getModulesArray(dest, libFiles, dest.LIB));

    if (path.existsSync(dest.EXT)) {
        extFiles = wrench.readdirSyncRecursive(dest.EXT);
        extModules = getModulesArray(dest, extFiles, dest.EXT);
        modulesList = modulesList.concat(extModules);
    }

    modulesStr += JSON.stringify(modulesList, null, "    ") + ";";
    fs.writeFileSync(path.normalize(dest.CHROME + "/frameworkModules.js"), modulesStr);
}

function copyWWE(session, target) {
    var conf = session.conf,
        src = path.normalize(util.format(conf.DEPENDENCIES_WWE, target) + "/wwe"),
        dest = path.normalize(session.sourceDir + "/wwe");

    fs.copySync(src, dest);
}

function copyBarDependencies(session, target) {
    var conf = session.conf,
        src = path.normalize(util.format(conf.DEPENDENCIES_BAR, target)),
        dest = path.normalize(session.sourcePaths.PLUGINS);

    if (!path.existsSync(dest)) {
        wrench.mkdirSyncRecursive(dest, "0755");
    }
    
    wrench.copyDirSyncRecursive(src, session.sourcePaths.PLUGINS);
}

function checkMissingFileInAPIFolder(apiDir, fileToCheck) {
    if (!path.existsSync(apiDir + "/" + fileToCheck)) {
        throw localize.translate("EXCEPTION_MISSING_FILE_IN_API_DIR", fileToCheck, apiDir);
    }
}

function hasValidExtension(file) {
    return VALID_EXTENSIONS.some(function (element, index, array) {
        return path.extname(file) === element;
    });
}

function checkNonJSFiles(dir) {
    var files = fs.readdirSync(dir),
        fullPath;

    files.forEach(function (f) {
        fullPath = path.join(dir, f);
        if (!fs.statSync(fullPath).isDirectory()) {
            if (hasValidExtension(fullPath)) {
                throw localize.translate("EXCEPTION_NON_JS_FILE_IN_API_DIR", fullPath);
            }
        } else {
            checkNonJSFiles(fullPath);
        }
    });
}

function checkAPIFolder(apiDir) {
    checkMissingFileInAPIFolder(apiDir, CLIENT_JS);
    checkMissingFileInAPIFolder(apiDir, SERVER_JS);
}

function copyExtension(session, target, featureId, extBasename) {
    var extPath = session.conf.EXT,
        apiDir = path.normalize(path.resolve(extPath, extBasename)),
        extDest = session.sourcePaths.EXT,
        soDest = session.sourcePaths.JNEXT_PLUGINS,
        soPath = path.normalize(path.join(apiDir, target)),
        jsFiles,
        soFiles;

    if (path.existsSync(apiDir)) {
        //verify mandatory api files exist
        checkAPIFolder(apiDir);

        //create output folders
        wrench.mkdirSyncRecursive(path.join(extDest, featureId), "0755");
        wrench.mkdirSyncRecursive(soDest, "0755");

        //find all .js and .json files
        jsFiles = packager_utils.listFiles(apiDir, function (file) {
            return hasValidExtension(file);
        });

        //Copy each .js file to its extensions folder
        jsFiles.forEach(function (jsFile) {
            packager_utils.copyFile(jsFile, path.join(extDest, featureId), apiDir);
        });

        if (path.existsSync(soPath)) {
            //find all .so files
            soFiles = packager_utils.listFiles(soPath, function (file) {
                return path.extname(file) === ".so";
            });

            //Copy each .so file to the extensions folder
            soFiles.forEach(function (soFile) {
                packager_utils.copyFile(soFile, soDest);
            });
        }
    }
}

function copyExtensions(accessList, session, target, extManager) {
    var extPath = session.conf.EXT,
        copied = {},
        extensions;

    if (path.existsSync(extPath)) {
        extensions = extManager.getAllExtensionsToCopy(accessList);

        extensions.forEach(function (extBasename) {
            var featureId = extManager.getFeatureIdByExtensionBasename(extBasename);

            if (!featureId) {
                // error - feature id not found
            }

            if (!copied.hasOwnProperty(featureId)) {
                copyExtension(session, target, featureId, extBasename);
                copied[featureId] = true;
            }
        });
    }
}

module.exports = {
    unzip: unzip,

    copyWWE: copyWWE,

    copyBarDependencies: copyBarDependencies,

    prepareOutputFiles: prepare,

    copyExtensions: copyExtensions,

    generateFrameworkModulesJS: generateFrameworkModulesJS,

    cleanSource: function (session) {
        if (!session.keepSource) {
            wrench.rmdirSyncRecursive(session.sourceDir);
        }
    }
};
