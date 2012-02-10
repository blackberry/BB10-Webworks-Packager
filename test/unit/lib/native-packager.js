var path = require("path"),
    srcPath = __dirname + "/../../../lib/",
    wrench = require("wrench"),
    nativePkgr = require(path.resolve(srcPath + "/native-packager")),
    files = require(path.resolve(srcPath + "/file-manager")),
    logger = require(path.resolve(srcPath + "/logger"));

describe("Native packager", function () {
    it("exec blackberry-nativepackager", function () {
        if (path.existsSync("dependencies/tools/bin")) {
            var outputDir = path.resolve("../packager.test"),
                session = {
                    "barPath": path.resolve(outputDir + "/Demo.bar"),
                    "outputDir": outputDir,
                    "sourceDir": path.resolve(outputDir + "/src"),
                    "archivePath": path.resolve("test/test.zip"),
                    "conf": require(path.resolve(srcPath + "/conf")),
                    "targets": ["simulator"]
                },
                config = {
                    "id": 'Demo',
                    "name": 'Demo',
                    "versionNumber": '1.0.0',
                    "author": 'Research In Motion Ltd.',
                    "description": 'This is a test!',
                    "image": 'test.png'
                };

            if (path.existsSync(session.outputDir)) {
                wrench.rmdirSyncRecursive(session.outputDir);
            }

            files.prepare(session, []);
            nativePkgr.exec(session, config, function (code) {
                expect(code).toEqual(0);
                expect(path.existsSync(session.barPath)).toBeTruthy();
            });
        }
    });
});
