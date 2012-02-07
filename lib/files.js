var path = require("path"),
    fs = require("fs"),
    util = require("util"),
    fstools = require("fs-tools"),
    wrench = require("wrench"),
    zip = require("zip"),
    logger = require("./logger"),
    conf = require("./conf"),
    bar_conf = require("./bar_conf"),
    localize = require("./localize");

function unzip(from, to) {
    var data, filesObj, p, parent;

    if (path.existsSync(from)) {
        data = fs.readFileSync(from);
        entries = zip.Reader(data).toObject();

        if (!path.existsSync(to)) {
            wrench.mkdirSyncRecursive(to, "0755");
        }

        for (p in entries) {
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

    if (path.existsSync(extPath)) {/*
        if (path.existsSync(to)) {
            wrench.rmdirSyncRecursive(to);
        }

        wrench.mkdirSyncRecursive(to, "0755");
        */
        features.forEach(function (id) {
            apiDir = path.resolve(extPath, id);

            if (path.existsSync(apiDir)) {
                fstools.copy(apiDir, to + "/" + id);
            }
        });
    }
}

function getExtensionModules(extSrcDir) {
    fstools.walk(extSrcDir, function (p, stats, callback) {
        if (path.basename(p) !== "client.js") {
            console.log(p);
        }
    });
}

module.exports = {
    prepare: function (session, features) {
        var srcLibDir = path.normalize(session.sourceDir + bar_conf.LIB),
            srcChromeDir = path.normalize(session.sourceDir + bar_conf.CHROME),
            srcExtDir = path.normalize(session.sourceDir + bar_conf.EXT);

        if (!path.existsSync(srcChromeDir)) {
            wrench.mkdirSyncRecursive(srcChromeDir, "0755");
        }

        // copy bootstrap
        wrench.copyDirSyncRecursive(conf.DEPENDENCIES_BOOTSTRAP, srcChromeDir);

        if (!path.existsSync(srcLibDir)) {
            wrench.mkdirSyncRecursive(srcLibDir, "0755");
        }

        // copy framework
        wrench.copyDirSyncRecursive(conf.LIB, srcLibDir);

        // unzip archive
        unzip(session.archivePath, session.sourceDir);

        // copy extensions
        copyExtensions(features, conf.EXT, srcExtDir);
    },

    cleanSource: function (session) {
    }
};
