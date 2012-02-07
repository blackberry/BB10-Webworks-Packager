var child_process = require("child_process"),
    fs = require("fs"),
    os = require("os"),
    path = require("path"),
    wrench = require("wrench"),
    conf = require("./conf"),
    logger = require("./logger"),
    localize = require("./localize"),
    NL = os.type().toLowerCase().indexOf("windows") >= 0 ? "\r\n" : "\n";

function generateTabletXMLFile() {}

function generateOptionsFile(session) {
    var srcFiles = wrench.readdirSyncRecursive(session.sourceDir),
        optionsStr = "-package" + NL;

    optionsStr += session.barPath + NL;
    optionsStr += "-C" + NL;
    optionsStr += session.sourceDir + NL;
    optionsStr += "blackberry-tablet.xml" + NL;

    srcFiles.forEach(function (file) {
        file = path.resolve(session.sourceDir, file);

        if (file.indexOf("blackberry-tablet.xml") < 0 && !fs.statSync(file).isDirectory()) {
            optionsStr += file + NL;
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
