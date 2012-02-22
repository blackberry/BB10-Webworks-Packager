var srcPath = __dirname + "/../../../lib/",
    path = require("path"),
    barBuilder = require(srcPath + "bar-builder"),
    fileMgr = require(srcPath + "file-manager"),
    testData = require("./test-data");

describe("BAR builder", function () {
    it("build() create BAR for specified session", function () {
        barBuilder.build(testData.session, testData.config, function () {
            fileMgr.cleanSource(testData.session);
            expect(path.existsSync(testData.session.barPath)).toBeTruthy();
        });
    });
});
