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
    fs = require("fsext"),
    wrench = require("wrench"),
    zip = require("zip"),
    localize = require("./localize"),
    CLIENT_JS = "client.js",
    SERVER_JS = "index.js";

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

    // unzip archive
    unzip(session.archivePath, session.sourceDir);
}

function copyBarDependencies(session) {
    wrench.copyDirSyncRecursive(conf.DEPENDENCIES_BAR, session.sourceDir);
}

function getModulesArray(dest, files, baseDir) {
    var modulesList = [];

    files.forEach(function (file) {
        file = path.resolve(baseDir, file);

        if (!fs.statSync(file).isDirectory()) {
            if (baseDir !== dest.EXT || path.basename(file) !== "client.js") {
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
        extFiles;

    modulesList = modulesList.concat(getModulesArray(dest, libFiles, dest.LIB));

    if (path.existsSync(dest.EXT)) {
        extFiles = wrench.readdirSyncRecursive(dest.EXT);
        modulesList = modulesList.concat(getModulesArray(dest, extFiles, dest.EXT));
    }

    modulesStr += JSON.stringify(modulesList) + ";";
    fs.writeFileSync(path.normalize(dest.CHROME + "/frameworkModules.js"), modulesStr);
}

function copyWWE(session, target) {
    var conf = session.conf,
        src = path.normalize(util.format(conf.DEPENDENCIES_WWE, target) + "/wwe"),
        dest = path.normalize(session.sourceDir + "/wwe");

    fs.copySync(src, dest);
}

function checkMissingFileInAPIFolder(apiDir, fileToCheck) {
    if (!path.existsSync(apiDir + "/" + fileToCheck)) {
        throw localize.translate("EXCEPTION_MISSING_FILE_IN_API_DIR", fileToCheck, apiDir);
    }
}

function checkNonJSFiles(dir) {
    var files = fs.readdirSync(dir),
        fullPath;

    files.forEach(function (f) {
        fullPath = path.join(dir, f);
        if (!fs.statSync(fullPath).isDirectory()) {
            if (path.extname(fullPath).toLowerCase() !== ".js") {
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
    checkNonJSFiles(apiDir);
}

function copyExtensions(accessList, extPath, to) {
    var apiDir,
        copied = {};

    if (path.existsSync(extPath)) {
        accessList.forEach(function (accessListEntry) {
            accessListEntry.features.forEach(function (feature) {
                apiDir = path.resolve(extPath, feature.id);

                if (!copied.hasOwnProperty(feature.id)) {
                    copied[feature.id] = true;

                    if (path.existsSync(apiDir)) {
                        checkAPIFolder(apiDir);
                        wrench.mkdirSyncRecursive(to + "/" + feature.id, "0755");
                        wrench.copyDirSyncRecursive(apiDir, to + "/" + feature.id);
                    } else {
                        throw localize.translate("EXCEPTION_FEATURE_NOT_FOUND", feature.id);
                    }
                }
            });
        });
    }
}

module.exports = {
    unzip: unzip,

    copyWWE: copyWWE,

    prepareOutputFiles: prepare,

    copyBarDependencies: copyBarDependencies,

    copyExtensions: copyExtensions,

    generateFrameworkModulesJS: generateFrameworkModulesJS,

    cleanSource: function (session) {
        if (!session.keepSource) {
            wrench.rmdirSyncRecursive(session.sourceDir);
        }
    }
};
