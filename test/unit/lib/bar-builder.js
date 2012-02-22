var srcPath = __dirname + "/../../../lib/",
    path = require("path"),
    util = require("util"),
    wrench = require("wrench"),
    barBuilder = require(srcPath + "bar-builder"),
    fileMgr = require(srcPath + "file-manager"),
    logger = require(srcPath + "logger"),
    testData = require("./test-data"),
    session = testData.session;

describe("BAR builder", function () {
    beforeEach(function () {
        if (path.existsSync(session.outputDir)) {
            wrench.rmdirSyncRecursive(session.outputDir);
        }

        fileMgr.prepareOutputFiles(session, []);
    });

    it("build() create BAR for specified session", function () {
        var callback = jasmine.createSpy(),
            target = session.targets[0];

        barBuilder.build(session, testData.config, callback);

        waitsFor(function () {
            return path.existsSync(util.format(session.barPath, target));
        });

        waits(2000);

        runs(function () {
            expect(callback).toHaveBeenCalledWith(0);
        });
    });
});
