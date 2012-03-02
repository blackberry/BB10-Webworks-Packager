var path = require("path"),
    wrench = require("wrench"),
    cmdline = require("./cmdline"),
    logger = require("./logger"),
    fileManager = require("./file-manager"),
    localize = require("./localize"),
    configParser = require("./config-parser"),
    packagerUtils = require("./packager-utils"),
    barBuilder = require("./bar-builder"),
    session;

try {
    cmdline.parse(process.argv);
    session = require("./session").initialize(cmdline);

    //prepare files for webworks archiving
    logger.info(localize.translate("PROGRESS_FILE_POPULATING_SOURCE"));
    fileManager.prepareOutputFiles(session);

    //parse config.xml
    logger.info(localize.translate("PROGRESS_SESSION_CONFIGXML"));
    configParser.parse(path.join(session.sourceDir, "config.xml"), function (configObj) {
        // copy extensions
        fileManager.copyExtensions(configObj.accessList, session.conf.EXT, session.sourcePaths.EXT);
        
        //generate user.js and frameworkModules.js
        logger.info(localize.translate("PROGRESS_GEN_OUTPUT"));
        //Adding debuEnabled property to user.js. Framework will enable/disable WebInspector based on that variable.
        configObj.debugEnabled = session.debug;
        packagerUtils.writeFile(path.join(session.sourcePaths.LIB, "config"), "user.js", "module.exports = " + JSON.stringify(configObj) + ";");

        fileManager.generateFrameworkModulesJS(session);

        barBuilder.build(session, configObj, function (code) {
            if (!session.keepSource) {
                fileManager.cleanSource(session);
            }

            if (code === 0) {
                logger.info(localize.translate("PROGRESS_COMPLETE"));
            }
        });
    });
} catch (e) {
    logger.error(e);
}
