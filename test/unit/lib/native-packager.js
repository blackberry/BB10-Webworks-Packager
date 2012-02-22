var path = require("path"),
    util = require("util"),
    srcPath = __dirname + "/../../../lib/",
    wrench = require("wrench"),
    nativePkgr = require(path.resolve(srcPath + "/native-packager")),
    fileMgr = require(path.resolve(srcPath + "/file-manager")),
    testData = require("./test-data"),
    session = testData.session,
    target = session.targets[0];

describe("Native packager", function () {
    beforeEach(function () {
        if (path.existsSync("dependencies/tools/bin")) {
            if (path.existsSync(session.outputDir)) {
                wrench.rmdirSyncRecursive(session.outputDir);
            }

            fileMgr.prepareOutputFiles(session, []);
            wrench.mkdirSyncRecursive(session.outputDir + "/" + target);
            fileMgr.copyWWE(session, target);
        }
    });

    it("exec blackberry-nativepackager", function () {
        if (path.existsSync("dependencies/tools/bin")) {
            var callback = jasmine.createSpy();

            nativePkgr.exec(session, target, testData.config, callback);

            waitsFor(function () {
                return path.existsSync(util.format(session.barPath, target));
            });

            waits(2000);

            runs(function () {
                expect(path.existsSync(util.format(session.barPath, target))).toBeTruthy();
                expect(callback).toHaveBeenCalledWith(0);
            });
        }
    });
});
