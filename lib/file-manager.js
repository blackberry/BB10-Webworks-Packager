var path = require("path"),
    util = require("util"),
    fs = require("fsext"),
    fstools = require("fs-tools"),
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

function copyExtensions(features, extPath, to) {
    var apiDir;

    if (path.existsSync(extPath)) {
        features.forEach(function (id) {
            apiDir = path.resolve(extPath, id);

            if (path.existsSync(apiDir)) {
                fstools.copy(apiDir, to + "/" + id);
            }
        });
    }
}

function prepare(session, features) {
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

    // copy extensions
    copyExtensions(features, conf.EXT, dest.EXT);
}

function generateFrameworkModulesJS(session) {
    var dest = session.sourcePaths,
        libFiles = wrench.readdirSyncRecursive(dest.LIB),
        modulesList = [],
        modulesStr = "var frameworkModules = ";

    libFiles.forEach(function (file) {
        file = path.resolve(dest.LIB, file);

        if (!fs.statSync(file).isDirectory()) {
            modulesList.push(path.relative(path.normalize(dest.CHROME), file).replace(/\\/g, "/"));
        }
    });

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
