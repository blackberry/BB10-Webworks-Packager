var child_process = require("child_process"),
    fs = require("fs"),
    os = require("os"),
    path = require("path"),
    wrench = require("wrench"),
    conf = require("./conf"),
    logger = require("./logger"),
    localize = require("./localize");

function generateTabletXMLFile() {}

function generateOptionsFile(session) {
    // double check line break on Mac
    var srcFiles = wrench.readdirSyncRecursive(session.sourceDir),
        optionsStr = "-package\r\n";

    optionsStr += session.barPath + "\r\n";
    optionsStr += "-C\r\n";
    optionsStr += session.sourceDir + "\r\n";
    optionsStr += "blackberry-tablet.xml\r\n";

    srcFiles.forEach(function (file) {
        if (file.indexOf("blackberry-tablet.xml") < 0 && !fs.statSync(file).isDirectory()) {
            optionsStr += file + "\r\n";
        }
    });

    fs.writeFileSync(path.normalize(session.sourceDir + "/options"), optionsStr);
}

function execNativePackager(session) {
    var script = "/bin/blackberry-nativepackager",
        cwd = session.sourceDir,
        nativePkgr;

    // TODO move to utils
    if (os.type().toLowerCase().indexOf("windows") >= 0) {
        script += ".bat";
    }
/*
    if (!path.existsSync(cwd)) {
        wrench.mkdirSyncRecursive(cwd, "0755");
    }
*/

    nativePkgr = child_process.spawn(path.normalize(conf.DEPENDENCIES_TOOLS + script), ["@options"], {
        "cwd": cwd,
        "env": process.env
    });

    nativePkgr.stdout.on("data", function (data) {
        logger.info(data.toString());
    });

    nativePkgr.stderr.on("data", function (data) {
        logger.error(data.toString());
    });

    nativePkgr.on("exit", function (code) {
        if (code !== 0) {
            throw localize.translate("EXCEPTION_NATIVEPACKAGER");
        }
    });
}

module.exports = {
    exec: function (session) {
        generateOptionsFile(session);
        generateTabletXMLFile();
        execNativePackager(session);
    }
};