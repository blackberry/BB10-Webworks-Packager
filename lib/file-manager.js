var path = require("path"),
    util = require("util"),
    fs = require("fsext"),
    wrench = require("wrench"),
    zip = require("zip"),
    logger = require("./logger"),
    localize = require("./localize");

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

module.exports = {
    unzip: unzip,

    copyWWE: copyWWE,

    prepareOutputFiles: prepare,

    generateFrameworkModulesJS: generateFrameworkModulesJS,

    cleanSource: function (session) {
        wrench.rmdirSyncRecursive(session.sourceDir);
    }
};
