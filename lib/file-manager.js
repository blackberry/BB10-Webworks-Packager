var path = require("path"),
    util = require("util"),
    fs = require("fsext"),
    fstools = require("fs-tools"),
    wrench = require("wrench"),
    zip = require("zip"),
    logger = require("./logger"),
    barConf = require("./bar-conf"),
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

module.exports = {
    prepare: function (session, features) {
        var srcLibDir = path.normalize(session.sourceDir + barConf.LIB),
            srcChromeDir = path.normalize(session.sourceDir + barConf.CHROME),
            srcExtDir = path.normalize(session.sourceDir + barConf.EXT),
            conf = session.conf;

        if (path.existsSync(session.sourceDir)) {
            wrench.rmdirSyncRecursive(session.sourceDir);
        }

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

        // copy WWE
        fs.copySync(path.normalize(util.format(conf.DEPENDENCIES_WWE, session.targets[0]) + "/wwe"), path.normalize(session.sourceDir + "/wwe"));
    },

    cleanSource: function (session) {
    }
};
