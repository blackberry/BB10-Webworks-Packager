var path = require("path"),
    outputDir = path.resolve("../packager.test"),
    libPath = __dirname + "/../../../lib/",
    barConf = require(libPath + "/bar-conf"),
    configPath = path.resolve("test") + "/config.xml";

module.exports = {
    libPath: libPath,
    configPath: configPath,
    session: {
        "barPath": outputDir + "/%s/" + "Demo.bar",
        "outputDir": outputDir,
        "sourceDir": path.resolve(outputDir + "/src"),
        "sourcePaths": {
            "ROOT": path.resolve(outputDir + "/src"),
            "CHROME": path.normalize(path.resolve(outputDir + "/src") + barConf.CHROME),
            "LIB": path.normalize(path.resolve(outputDir + "/src") + barConf.LIB),
            "EXT": path.normalize(path.resolve(outputDir + "/src") + barConf.EXT)
        },
        "archivePath": path.resolve("test/test.zip"),
        "conf": require(path.resolve(libPath + "/conf")),
        "targets": ["simulator"]
    },
    config: {
        "id": 'Demo',
        "name": 'Demo',
        "version": '1.0.0',
        "author": 'Research In Motion Ltd.',
        "description": 'This is a test!',
        "image": 'test.png'
    }
};
