var child_process = require("child_process"),
    os = require("os"),
    path = require("path"),
    wrench = require("wrench"),
    conf = require("./conf"),
    logger = require("./logger"),
    localize = require("./localize");

function generateTabletXMLFile() {}

function generateOptionsFile() {

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
	logger.line(path.normalize(conf.DEPENDENCIES_TOOLS) + script);
    nativePkgr = child_process.spawn(path.normalize(conf.DEPENDENCIES_TOOLS + script), ["@options"], {
        "cwd": cwd,
        "env": process.env
    });

//    nativePkgr.stdout.on("data", function (data) {
//        logger.info("From nativepackager:\n");
//        logger.info(data);
//    });

    nativePkgr.stderr.on("data", function (data) {
        logger.info("From nativepackager:\n");
        logger.error(data);
    });

    nativePkgr.on("exit", function (code) {
        if (code !== 0) {
            throw localize.translate("EXCEPTION_NATIVEPACKAGER");
        }
    });
}

module.exports = {
    exec: function (session) {
        generateTabletXMLFile();
        generateOptionsFile();
        execNativePackager(session);
    }
};