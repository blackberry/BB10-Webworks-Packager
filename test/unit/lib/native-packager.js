var path = require("path"),
    util = require("util"),
    fs = require("fs"),
    childProcess = require("child_process"),
    wrench = require("wrench"),
    srcPath = __dirname + "/../../../lib/",
    nativePkgr = require(srcPath + "/native-packager"),
    pkgrUtils = require(srcPath + "/packager-utils"),
    testData = require("./test-data");

describe("Native packager", function () {
    it("exec blackberry-nativepackager", function () {
        if (path.existsSync("dependencies/tools/bin")) {
            var callback = jasmine.createSpy(),
                config = testData.config,
                session = testData.session,
                target = session.targets[0],
                result = {
                    stdout: {
                        on: jasmine.createSpy()
                    },
                    stderr: {
                        on: jasmine.createSpy()
                    },
                    on: function (eventName, callback) {
                        callback(0);
                    }
                },
                bbTabletXML = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" +
                    "<qnx><id>" + config.id + "</id>" +
                    "<name>" + config.name + "</name>" +
                    "<versionNumber>" + config.version + "</versionNumber>" +
                    "<author>" + config.author + "</author>" +
                    "<asset entry=\"true\" type=\"qnx/elf\">wwe</asset>" +
                    "<initialWindow><systemChrome>none</systemChrome><transparent>true</transparent></initialWindow>" +
                    "<env value=\"12\" var=\"WEBKIT_NUMBER_OF_BACKINGSTORE_TILES\"></env>" +
                    "<permission system=\"true\">run_native</permission>" +
                    "<description>" + config.description + "</description></qnx>",
                cmd = path.normalize(session.conf.DEPENDENCIES_TOOLS + "/bin/blackberry-nativepackager.bat");

            spyOn(wrench, "readdirSyncRecursive").andReturn(["abc", "xyz"]);
            spyOn(fs, "statSync").andReturn({
                isDirectory: function () {
                    return false;
                }
            });
            spyOn(fs, "writeFileSync");
            spyOn(pkgrUtils, "writeFile");
            spyOn(childProcess, "spawn").andReturn(result);

            nativePkgr.exec(session, target, testData.config, callback);

            expect(fs.writeFileSync).toHaveBeenCalledWith(jasmine.any(String), jasmine.any(String));
            expect(pkgrUtils.writeFile).toHaveBeenCalledWith(session.sourceDir, "blackberry-tablet.xml", bbTabletXML);
            expect(childProcess.spawn).toHaveBeenCalledWith(cmd, ["@options"], {"cwd": session.sourceDir, "env": process.env});
            expect(callback).toHaveBeenCalledWith(0);
        }
    });
});
