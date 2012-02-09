var path = require("path"),
    srcPath = __dirname + "/../../../lib/",
    fs = require("fs"),
    wrench = require("wrench"),
    nativePkgr = require(path.resolve(srcPath + "/native-packager")),
    files = require(path.resolve(srcPath + "/file-manager")),
    logger = require(path.resolve(srcPath + "/logger"));

describe("Native packager", function () {
    it("exec blackberry-nativepackager", function () {
        if (path.existsSync("dependencies/tools/bin")) {
            var outputDir = path.resolve("test_bar"),
                session = {
                "barPath": path.resolve(outputDir + "/Demo.bar"),
                "outputDir": outputDir,
                "sourceDir": path.resolve(outputDir + "/src"),
                "archivePath": path.resolve("test/test.zip"),
                "conf": require(path.resolve(srcPath + "/conf")),
                "targets": ["simulator"]
            };

            if (path.existsSync(session.outputDir)) {
                wrench.rmdirSyncRecursive(session.outputDir);
            }

            files.prepare(session, []);
            nativePkgr.exec(session);

            fs.watch(outputDir, function (event, filename) {
                expect(path.existsSync(session.barPath)).toBeTruthy();
            });
        }
    });
});
