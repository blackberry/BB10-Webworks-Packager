var path = require("path"),
    wrench = require("wrench"),
    jWorkflow = require("jWorkflow"),
    cmdline = require("./cmdline"),
    logger = require("./logger"),
    fileManager = require("./file-manager"),
    nativePkgr = require("./native-packager"),
    localize = require("./localize"),
    xmlParser = require("./xml-parser"),
    packagerUtils = require("./packager-utils"),
    session,
    build,
    current = 0,
    target,
    config;

function buildTarget(previous, baton) {
    baton.take();
    target = session.targets[current++];
    wrench.mkdirSyncRecursive(session.outputDir + "/" + target);
    fileManager.copyWWE(session, target);
    nativePkgr.exec(session, target, config, function (code) {
        if (code !== 0) {
            logger.error(localize.translate("EXCEPTION_NATIVEPACKAGER"));
        }

        baton.pass();
    });
}

function copyExtensions(accessList, extPath, to) {
    var apiDir;

    if (path.existsSync(extPath)) {
        accessList.forEach(function (accessListEntry) {
            accessListEntry.features.forEach(function (feature) {
                apiDir = path.resolve(extPath, feature.id);

                if (path.existsSync(apiDir)) {
                    wrench.mkdirSyncRecursive(to + "/" + feature.id, "0755");
                    wrench.copyDirSyncRecursive(apiDir, to + "/" + feature.id);
                }
            });
        });
    }
}

try {
    cmdline.parse(process.argv);
    session = require("./session").initialize(cmdline);

    //prepare files for webworks archiving
    logger.info(localize.translate("PROGRESS_FILE_POPULATING_SOURCE"));
    fileManager.prepareOutputFiles(session);

    //parse config.xml
    logger.info(localize.translate("PROGRESS_SESSION_CONFIGXML"));
    xmlParser.parse(path.join(session.sourceDir, "config.xml"), function (configObj) {
        // copy extensions
        copyExtensions(configObj.accessList, session.conf.EXT, session.sourcePaths.EXT);
        
        //generate user.js and frameworkModules.js
        logger.info(localize.translate("PROGRESS_GEN_OUTPUT"));
        packagerUtils.writeFile(path.join(session.sourcePaths.LIB, "config"), "user.js", "module.exports = " + JSON.stringify(configObj) + ";");

        fileManager.generateFrameworkModulesJS(session);
        config = configObj;

        // TODO some clean-up to do for building multiple targets
        build = jWorkflow.order(buildTarget).andThen(buildTarget);
        build.start({
            callback: function () {
                if (!session.keepSource) {
                    fileManager.cleanSource(session);
                }

                logger.info(localize.translate("PROGRESS_COMPLETE"));
            }
        });
    });
} catch (e) {
    logger.error(e);
}
