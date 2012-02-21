var jWorkflow = require("jWorkflow"),
    wrench = require("wrench"),
    nativePkgr = require("./native-packager"),
    fileManager = require("./file-manager"),
    localize = require("./localize"),
    logger = require("./logger");

function buildTarget(targetIdx, baton) {
    baton.take();

    var target = this.session.targets[targetIdx++];
    wrench.mkdirSyncRecursive(this.session.outputDir + "/" + target);
    fileManager.copyWWE(this.session, target);
    nativePkgr.exec(this.session, target, this.config, function (code) {
        if (code !== 0) {
            logger.error(localize.translate("EXCEPTION_NATIVEPACKAGER"));
        }

        baton.pass(targetIdx);
    });
}

function buildWorkflow(session, context) {
    if (session.targets && session.targets.length > 0) {
        var order;

        session.targets.forEach(function (target, idx) {
            if (idx === 0) {
                order = jWorkflow.order(buildTarget, context);
            } else {
                order = order.andThen(buildTarget, context);
            }
        });

        return order;
    } else {
        logger.debug("NOTHING TO BUILD, NO TARGETS");
    }
}

module.exports = {
    build: function (session, config, callback) {
        var context = {
                session: session,
                config: config
            },
            workflow = buildWorkflow(session, context);

        if (workflow) {
            workflow.start({
                initialValue: 0,
                callback: callback
            });
        }
    }
};