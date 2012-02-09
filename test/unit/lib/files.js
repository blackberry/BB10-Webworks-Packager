var srcPath = __dirname + "/../../../lib/";
    path = require("path"),
    fs = require("fs"),
    wrench = require("wrench"),
    logger = require(srcPath + "logger"),
    files = require(srcPath + "files"),
    bar_conf = require(srcPath + "bar_conf");

describe("Files", function () {
    beforeEach(function () {
        var wweDir = path.resolve("dependencies/simulator-wwe");

        if (!path.existsSync(wweDir)) {
            wrench.mkdirSyncRecursive(wweDir, "0755");
        }

        if (!path.existsSync(path.normalize(wweDir + "/wwe"))) {
            fs.writeFileSync(path.normalize(wweDir + "/wwe"), "");
        }
    });

    it("prepare() should copy files and unzip archive", function () {
        var session = {
            "sourceDir": path.resolve("test/test_src"),
            "archivePath": path.resolve("test/test.zip"),
            "conf": require(srcPath + "conf"),
            targets: ["simulator"]
        };

        files.prepare(session, []);

        expect(path.existsSync(path.resolve(session.sourceDir + "/wwe"))).toBeTruthy();
        expect(path.existsSync(path.resolve(session.sourceDir + bar_conf.CHROME))).toBeTruthy();
        expect(path.existsSync(path.resolve(session.sourceDir + bar_conf.LIB))).toBeTruthy();
    });
});
