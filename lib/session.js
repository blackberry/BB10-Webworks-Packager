var path = require("path"),
    wrench = require("wrench"),
    logger = require("./logger"),
    barConf = require("./bar-conf");

module.exports = {
    initialize: function (cmdline) {
        var sourceDir,
            outputDir = cmdline.output,
            archivePath = path.resolve(cmdline.args[0]),
            archiveName = path.basename(archivePath);

        if (cmdline.source && "string" === typeof cmdline.source) {
            sourceDir = cmdline.source;
        } else {
            sourceDir = outputDir + "/src";
        }

        if (!path.existsSync(sourceDir)) {
            wrench.mkdirSyncRecursive(sourceDir, "0755");
        }

        return {
            "conf": require("./conf"),
            "keepSource": !!cmdline.source,
            "sourceDir": path.resolve(sourceDir),
            "sourcePaths": {
                "ROOT": path.resolve(sourceDir),
                "CHROME": path.normalize(path.resolve(sourceDir) + barConf.CHROME),
                "LIB": path.normalize(path.resolve(sourceDir) + barConf.LIB),
                "EXT": path.normalize(path.resolve(sourceDir) + barConf.EXT)
            },
            "outputDir": path.resolve(outputDir),
            "archivePath": archivePath,
            "archiveName": archiveName,
            "barPath": path.resolve(outputDir + "/Demo.bar"), // TODO
            "verbose": !!cmdline.verbose,
            "debug": !!cmdline.debug,
            "targets": ["simulator"] // TODO
        };
    }
};

