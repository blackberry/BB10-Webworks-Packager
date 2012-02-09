var cmdline = require("./cmdline"),
    logger = require("./logger"),
    fileManager = require("./file-manager"),
    nativePkgr = require("./native-packager"),
    localize = require("./localize"),
    xmlPkgr = require("./xml-pkgr"),
    path = require("path"),
    packagerUtils = require("./packager-utils"),
    session;

try {
    cmdline.parse(process.argv);
    session = require("./session").initialize(cmdline);

    //prepare files for webworks archiving
    fileManager.prepare(session, []); // TODO, array should be list of features in whitelist
    
    //parse config.xml
    logger.info(localize.translate("PROGRESS_SESSION_CONFIGXML"));
    xmlPkgr.parse(path.join(session.sourceDir, "config.xml"), function (configObj) {
        // gen user.js and frameworkModules.js
        logger.info(localize.translate("PROGRESS_FILE_POPULATING_SOURCE"));
        packagerUtils.writeFile(session.sourceDir, "user.js", "module.exports = " + JSON.stringify(configObj) + ";");
        //TODO gen frameworkModules.js here
    
        logger.info(localize.translate("PROGRESS_GEN_OUTPUT"));
    
        //gen bar
        logger.info(localize.translate("PROGRESS_PACKAGING"));
        nativePkgr.exec(session, configObj);

        if (!session.keepSource) {
            fileManager.cleanSource(session);
        }

        logger.info(localize.translate("PROGRESS_COMPLETE"));
    });
} catch (e) {
    logger.error(e);
}

