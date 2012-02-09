var cmdline = require("./cmdline"),
    logger = require("./logger"),
    files = require("./files"),
    nativePkgr = require("./native_packager"),
    localize = require("./localize"),
    session;

try {
    cmdline.parse(process.argv);
    session = require("./session").initialize(cmdline);

    logger.info(localize.translate("PROGRESS_SESSION_CONFIGXML"));
    //parsing

    logger.info(localize.translate("PROGRESS_FILE_POPULATING_SOURCE"));
    // gen user.js

    // gen frameworkModules.js --->
    // var frameworkModules = [];

    files.prepare(session, []); // TODO, array should be list of features in whitelist
    logger.info(localize.translate("PROGRESS_GEN_OUTPUT"));
    logger.info(localize.translate("PROGRESS_PACKAGING"));
    nativePkgr.exec(session);

    if (!session.keepSource) {
        files.cleanSource(session);
    }

    logger.info(localize.translate("PROGRESS_COMPLETE"));
} catch (e) {
    logger.error(e);
}

