var path = require("path"),
    srcPath = __dirname + "/../../../lib/",
    wrench = require("wrench"),
    nativePkgr = require(path.resolve(srcPath + "/native-packager")),
    files = require(path.resolve(srcPath + "/file-manager")),
    testData = require("./test-data"),
    logger = require(path.resolve(srcPath + "/logger"));

describe("Native packager", function () {
    it("exec blackberry-nativepackager", function () {
        if (path.existsSync("dependencies/tools/bin")) {
            if (path.existsSync(testData.session.outputDir)) {
                wrench.rmdirSyncRecursive(testData.session.outputDir);
            }

            files.prepare(testData.session, []);
            nativePkgr.exec(testData.session, testData.config, function (code) {
                expect(code).toEqual(0);
                expect(path.existsSync(testData.session.barPath)).toBeTruthy();
            });
        }
    });
});
