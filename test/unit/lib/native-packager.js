var path = require("path"),
    util = require("util"),
    fs = require("fs"),
    childProcess = require("child_process"),
    wrench = require("wrench"),
    srcPath = __dirname + "/../../../lib/",
    nativePkgr = require(srcPath + "/native-packager"),
    pkgrUtils = require(srcPath + "/packager-utils"),
    testData = require("./test-data"),
    logger = require(srcPath + "logger"),
    localize = require(srcPath + "/localize"),
    callback,
    config,
    session,
    target,
    result,
    orgDebugEnabled,
    orgDebugTokenPath;

describe("Native packager", function () {
    beforeEach(function () {
        callback = jasmine.createSpy();
        config = testData.config;
        session = testData.session;
        target = session.targets[0];
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
        };

        // Store original debug token setting and later restore them in afterEach
        // to be able to test positive and negative cases of each.
        orgDebugEnabled = session.debug;
        orgDebugTokenPath = session.conf.DEBUG_TOKEN;

        spyOn(wrench, "readdirSyncRecursive").andReturn(["abc", "xyz"]);
        spyOn(fs, "statSync").andReturn({
            isDirectory: function () {
                return false;
            }
        });
        spyOn(fs, "writeFileSync");
        spyOn(pkgrUtils, "writeFile");
        spyOn(childProcess, "spawn").andReturn(result);
    });

    afterEach(function () {
        session.debug = orgDebugEnabled;
        session.conf.DEBUG_TOKEN = orgDebugTokenPath;
    });

    it("should not display empty messages in logger", function () {
        spyOn(logger, "warn");
        spyOn(logger, "error");
        spyOn(logger, "info");

        nativePkgr.exec(session, target, testData.config, callback);

        expect(logger.warn).not.toHaveBeenCalledWith("");
        expect(logger.error).not.toHaveBeenCalledWith("");
        expect(logger.info).not.toHaveBeenCalledWith("");
    });

    it("shows debug token warning when path to file is not valid", function () {
        spyOn(logger, "warn");

        session.debug = true;
        //Current time will ensure that the file doesn't exist.
        session.conf.DEBUG_TOKEN = new Date().getTime() + ".bar";

        nativePkgr.exec(session, target, testData.config, callback);

        expect(logger.warn).toHaveBeenCalledWith(localize.translate("EXCEPTION_DEBUG_TOKEN_NOT_FOUND"));
    });

    it("won't show debug token warning when -d options wasn't provided", function () {
        spyOn(logger, "warn");

        session.debug = false;
        //Current time will ensure that the file doesn't exist.
        session.conf.DEBUG_TOKEN = new Date().getTime() + ".bar";

        nativePkgr.exec(session, target, testData.config, callback);

        expect(logger.warn).not.toHaveBeenCalled();
    });

    it("shows debug token warning when debug token not a .bar file", function () {
        spyOn(logger, "warn");

        session.debug = true;
        //Current time will ensure that the file doesn't exist.
        session.conf.DEBUG_TOKEN = new Date().getTime() + ".xyz";

        nativePkgr.exec(session, target, testData.config, callback);
        expect(logger.warn).toHaveBeenCalledWith(localize.translate("EXCEPTION_DEBUG_TOKEN_WRONG_FILE_EXTENSION"));
    });

    it("exec blackberry-nativepackager", function () {
        var bbTabletXML = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" +
            "<qnx><id>" + config.id + "</id>" +
            "<name>" + config.name + "</name>" +
            "<versionNumber>" + config.version + "</versionNumber>" +
            "<author>" + config.author + "</author>" +
            "<asset entry=\"true\" type=\"qnx/elf\">wwe</asset>" +
            "<asset>abc</asset>" +
            "<asset>xyz</asset>" +
            "<initialWindow><systemChrome>none</systemChrome><transparent>true</transparent></initialWindow>" +
            "<env value=\"12\" var=\"WEBKIT_NUMBER_OF_BACKINGSTORE_TILES\"></env>" +
            "<permission system=\"true\">run_native</permission>" +
            "<description>" + config.description + "</description></qnx>",
            cmd = path.normalize(session.conf.DEPENDENCIES_TOOLS + "/bin/blackberry-nativepackager" + (pkgrUtils.isWindows() ? ".bat" : ""));

        nativePkgr.exec(session, target, testData.config, callback);
            
        expect(fs.writeFileSync).toHaveBeenCalledWith(jasmine.any(String), jasmine.any(String));
        expect(pkgrUtils.writeFile).toHaveBeenCalledWith(session.sourceDir, "blackberry-tablet.xml", bbTabletXML);
        expect(childProcess.spawn).toHaveBeenCalledWith(cmd, ["@options"], {"cwd": session.sourceDir, "env": process.env});
        expect(callback).toHaveBeenCalledWith(0);
    });
});
