/*
 *  Copyright 2012 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var jWorkflow = require("jWorkflow"),
    wrench = require("wrench"),
    nativePkgr = require("./native-packager"),
    fileManager = require("./file-manager"),
    localize = require("./localize"),
    logger = require("./logger"),
    targetIdx = 0;

function buildTarget(previous, baton) {
    baton.take();

    var target = this.session.targets[targetIdx++];
    
    //Create output folder
    wrench.mkdirSyncRecursive(this.session.outputDir + "/" + target);
    
    //Copy target dependent files
    fileManager.copyWWE(this.session, target);
    fileManager.copyBarDependencies(this.session, target);
    fileManager.copyExtensions(this.config.accessList, this.session, target, this.extManager);
    
    //Generate frameworkModules.js (this needs to be done AFTER all files have been copied)
    fileManager.generateFrameworkModulesJS(this.session);
    
    //Call native-packager module for target
    nativePkgr.exec(this.session, target, this.config, function (code) {
        if (code !== 0) {
            logger.error(localize.translate("EXCEPTION_NATIVEPACKAGER"));
        }

        baton.pass(code);
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
    build: function (session, config, extManager, callback) {
        var context = {
                session: session,
                config: config,
                extManager: extManager
            },
            workflow = buildWorkflow(session, context);

        if (workflow) {
            workflow.start({
                "callback": callback
            });
        }
    }
};