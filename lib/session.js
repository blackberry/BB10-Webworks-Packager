var path = require("path"),
    wrench = require("wrench"),
    logger = require("./logger"),
    barConf = require("./bar-conf");

module.exports = {
    initialize: function (cmdline) {
        var sourceDir,
            outputDir = cmdline.output,
            archivePath = path.resolve(cmdline.args[0]),
            archiveName = path.basename(archivePath, '.zip');

        //If -o option was not provided, default output location is the same as .zip.
        outputDir = outputDir || path.dirname(archivePath);

        //If -s [dir] is provided
        if (cmdline.source && "string" === typeof cmdline.source) {
            sourceDir = cmdline.source + "/src";
        } else {
            sourceDir = outputDir + "/src";
        }

        if (!path.existsSync(sourceDir)) {
            wrench.mkdirSyncRecursive(sourceDir, "0755");
        }
        
        // If the source path is relative, determine the absolute path
        if (sourceDir.indexOf(".") === 0) {
            sourceDir = path.resolve(sourceDir);
        }

        return {
            "conf": require("./conf"),
            "keepSource": !!cmdline.source,
            "sourceDir": path.normalize(sourceDir),
            "sourcePaths": {
                "ROOT": path.resolve(sourceDir),
                "CHROME": path.normalize(path.resolve(sourceDir) + barConf.CHROME),
                "LIB": path.normalize(path.resolve(sourceDir) + barConf.LIB),
                "EXT": path.normalize(path.resolve(sourceDir) + barConf.EXT)
            },
            "outputDir": path.resolve(outputDir),
            "archivePath": archivePath,
            "archiveName": archiveName,
            "barPath": outputDir + "/%s/" + archiveName + ".bar",
            "verbose": !!cmdline.verbose,
            "debug": !!cmdline.debug,
            "targets": ["simulator", "device"] // TODO
        };
    }
};

