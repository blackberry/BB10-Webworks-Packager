var path = require("path"),
    wrench = require("wrench"),
    cmdline = require("./cmdline"),
    logger = require("./logger"),
    fileManager = require("./file-manager"),
    nativePkgr = require("./native-packager"),
    localize = require("./localize"),
    xmlParser = require("./xml-parser"),
    packagerUtils = require("./packager-utils"),
    session;

try {
    cmdline.parse(process.argv);
    session = require("./session").initialize(cmdline);

    //prepare files for webworks archiving
    logger.info(localize.translate("PROGRESS_FILE_POPULATING_SOURCE"));
    fileManager.prepare(session, []); // TODO, array should be list of features in whitelist

    //parse config.xml
    logger.info(localize.translate("PROGRESS_SESSION_CONFIGXML"));
    xmlParser.parse(path.join(session.sourceDir, "config.xml"), function (configObj) {
        //generate user.js and frameworkModules.js
        logger.info(localize.translate("PROGRESS_GEN_OUTPUT"));
        packagerUtils.writeFile(path.join(session.sourcePaths.LIB, "config"), "user.js", "module.exports = " + JSON.stringify(configObj) + ";");

        fileManager.generateFrameworkModulesJS(session);
        session.targets.forEach(function (target, idx, targets) {
            wrench.mkdirSyncRecursive(session.outputDir + "/" + target); 
            fileManager.copyWWE(session, target);
            //generate BAR
            nativePkgr.exec(session, target, configObj, function (code) {
                if (code !== 0) {
                    logger.error(localize.translate("EXCEPTION_NATIVEPACKAGER"));
                }

                if (idx === targets.length - 1) {
                    if (!session.keepSource) {
                        fileManager.cleanSource(session);
                    }

                    logger.info(localize.translate("PROGRESS_COMPLETE"));
                }
            });
        });
    });
} catch (e) {
    logger.error(e);
}
