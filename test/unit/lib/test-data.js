var path = require("path"),
    outputDir = path.resolve("../packager.test"),
    libPath = __dirname + "/../../../lib/",
    configPath = path.resolve("test") + "/config.xml";

module.exports = {
    libPath: libPath,
    configPath: configPath,
    session: {
        "barPath": path.resolve(outputDir + "/Demo.bar"),
        "outputDir": outputDir,
        "sourceDir": path.resolve(outputDir + "/src"),
        "archivePath": path.resolve("test/test.zip"),
        "conf": require(path.resolve(libPath + "/conf")),
        "targets": ["simulator"]
    },
    config: {
        "id": 'Demo',
        "name": 'Demo',
        "versionNumber": '1.0.0',
        "author": 'Research In Motion Ltd.',
        "description": 'This is a test!',
        "image": 'test.png'
    }
};
