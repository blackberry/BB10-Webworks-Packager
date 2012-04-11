var srcPath = __dirname + "/../../../lib/",
    fs = require("fsext"),
    path = require("path"),
    util = require("util"),
    localize = require(srcPath + "localize"),
    wrench = require("wrench"),
    logger = require(srcPath + "logger"),
    fileMgr = require(srcPath + "file-manager"),
    testData = require("./test-data"),
    session = testData.session;

describe("File manager", function () {
    it("prepareOutputFiles() should copy files and unzip archive", function () {
        fileMgr.prepareOutputFiles(session);

        expect(path.existsSync(session.sourcePaths.CHROME)).toBeTruthy();
        expect(path.existsSync(session.sourcePaths.LIB)).toBeTruthy();
    });

    it("copyWWE() should copy wwe of the specified target", function () {
        spyOn(fs, "copySync");

        fileMgr.copyWWE(session, "simulator");

        expect(fs.copySync).toHaveBeenCalledWith(path.normalize(util.format(session.conf.DEPENDENCIES_WWE, "simulator") + "/wwe"), path.normalize(session.sourceDir + "/wwe"));
    });

    it("copyBarDependencies() should copy bar-dependencies dir contents to the specified target", function () {
        spyOn(wrench, "copyDirSyncRecursive");

        fileMgr.copyBarDependencies(session);

        expect(wrench.copyDirSyncRecursive).toHaveBeenCalledWith(path.normalize(session.conf.DEPENDENCIES_BAR), path.normalize(session.sourceDir));
    });

    it("copyExtensions() should copy files required by features listed in config.xml", function () {
        var session = testData.session,
            feature = "blackberry.app",
            extPath = session.sourcePaths.EXT,
            toDir = extPath + "/" + feature,
            apiDir = path.resolve(session.conf.EXT, feature),
            accessList = testData.accessList;

        spyOn(path, "existsSync").andReturn(true);
        spyOn(wrench, "mkdirSyncRecursive");
        spyOn(wrench, "copyDirSyncRecursive");

        fileMgr.copyExtensions(accessList, session.conf.EXT, extPath);

        expect(path.existsSync).toHaveBeenCalledWith(apiDir);
        expect(wrench.mkdirSyncRecursive).toHaveBeenCalledWith(toDir, "0755");
        expect(wrench.copyDirSyncRecursive).toHaveBeenCalledWith(apiDir, toDir);
    });

    it("copyExtension() should throw an error when a specified feature cannot be found in ext folder", function () {
        var session = testData.session,
            accessList = [{
                uri: "http://www.cnn.com",
                allowSubDomain: false,
                features: [{
                    id: "abc.def.ijk",
                    required: true,
                    version: "1.0.0"
                }]
            }];

        expect(function () {
            fileMgr.copyExtensions(accessList, session.conf.EXT, session.sourcePaths.EXT);
        }).toThrow(new Error("Failed to find feature with id: abc.def.ijk"));
    });
    
    it("throws an error when the client.js file does not exist in ext folder", function () {
        var session = testData.session,
            accessList = testData.accessList;

        //When checking if client.js exists, return false
        spyOn(path, "existsSync").andCallFake(function (mPath) {
            return mPath.indexOf("client.js") === -1;
        });

        //Return a dummy path 
        spyOn(path, "resolve").andReturn("/I/DO/NOT/EXIST");
            
        expect(function () {
            fileMgr.copyExtensions(accessList, session.conf.EXT, session.sourcePaths.EXT);
        }).toThrow(new Error(localize.translate("EXCEPTION_MISSING_FILE_IN_API_DIR", "client.js", "/I/DO/NOT/EXIST")));
    });
    
    it("throws an error when the index.js file does not exist in ext folder", function () {
        var session = testData.session,
            accessList = testData.accessList;

        //When checking if client.js exists, return false
        spyOn(path, "existsSync").andCallFake(function (mPath) {
            return mPath.indexOf("index.js") === -1;
        });

        //Return a dummy path 
        spyOn(path, "resolve").andReturn("/I/DO/NOT/EXIST");
            
        expect(function () {
            fileMgr.copyExtensions(accessList, session.conf.EXT, session.sourcePaths.EXT);
        }).toThrow(new Error(localize.translate("EXCEPTION_MISSING_FILE_IN_API_DIR", "index.js", "/I/DO/NOT/EXIST")));
    });
    
    it("throws an error when there are non-js files in ext folder", function () {
        var session = testData.session,
            accessList = testData.accessList,
            clientJsPath = path.join(session.conf.EXT, "/blackberry.app/client.js");

        //When checking if client.js is a .js file, return a .nonJsExtension
        spyOn(path, "extname").andCallFake(function (mPath) {
            return (mPath.indexOf("client.js") !== -1) ? ".nonJsExtension" : ".js";
        });
            
        expect(function () {
            fileMgr.copyExtensions(accessList, session.conf.EXT, session.sourcePaths.EXT);
        }).toThrow(new Error(localize.translate("EXCEPTION_NON_JS_FILE_IN_API_DIR", clientJsPath)));
    });

    it("generateFrameworkModulesJS() should create frameworkModules.js", function () {
        var files = [],
            modulesArr;

        files.push(path.normalize(session.sourcePaths.CHROME + "/lib/framework.js"));
        files.push(path.normalize(session.sourcePaths.CHROME + "/lib/config/user.js"));
        files.push(path.normalize(session.sourcePaths.CHROME + "/lib/plugins/bridge.js"));
        files.push(path.normalize(session.sourcePaths.CHROME + "/lib/policy/whitelist.js"));
        files.push(path.normalize(session.sourcePaths.CHROME + "/ext/blackberry.app/client.js"));

        spyOn(wrench, "readdirSyncRecursive").andReturn(files);
        spyOn(fs, "statSync").andReturn({
            isDirectory: function () {
                return false;
            }
        });
        spyOn(path, "existsSync").andReturn(true);
        spyOn(JSON, "stringify");
        spyOn(fs, "writeFileSync");

        fileMgr.generateFrameworkModulesJS(session);

        modulesArr = JSON.stringify.mostRecentCall.args[0];
        modulesArr.forEach(function (module) {
            expect(module.match(/^lib\/|^ext\//)).toBeTruthy();
        });
        expect(modulesArr).toContain("lib/framework.js");
        expect(modulesArr).toContain("lib/config/user.js");
        expect(modulesArr).toContain("lib/plugins/bridge.js");
        expect(modulesArr).toContain("lib/policy/whitelist.js");
        expect(modulesArr).toContain("ext/blackberry.app/client.js");
    });

    it("unzip() should extract 'from' zip file to 'to' directory", function () {
        var from = session.archivePath,
            to = session.sourceDir;

        fileMgr.unzip(from, to);

        expect(fs.statSync(session.sourceDir + "/a").isDirectory()).toBeTruthy();
        expect(fs.statSync(session.sourceDir + "/a/dummy.txt").isFile()).toBeTruthy();
        expect(fs.statSync(session.sourceDir + "/a/b").isDirectory()).toBeTruthy();
        expect(fs.statSync(session.sourceDir + "/a/b/dummy2.txt").isFile()).toBeTruthy();
        expect(fs.statSync(session.sourceDir + "/startPage.html").isFile()).toBeTruthy();
        expect(fs.statSync(session.sourceDir + "/config.xml").isFile()).toBeTruthy();
        expect(fs.statSync(session.sourceDir + "/test.png").isFile()).toBeTruthy();
        expect(fs.statSync(session.sourceDir + "/webworks.js").isFile()).toBeTruthy();
    });

    it("cleanSource() should delete source folder", function () {
        expect(path.existsSync(session.sourceDir)).toBeTruthy();
        expect(fs.statSync(session.sourceDir).isDirectory()).toBeTruthy();
        fileMgr.cleanSource(session);
        expect(path.existsSync(session.sourceDir)).toBeFalsy();
    });
});
