var testData = require('./test-data'),
    signingHelper = require(testData.libPath + '/signing-helper'),
    localize = require(testData.libPath + '/localize'),
    path = require('path'),
    os = require('os');

describe("signing-helper", function () {
    it("can find keys in windows Local Settings", function () {
        spyOn(os, "type").andReturn("windows");
        
        spyOn(path, "existsSync").andCallFake(function (path) {
            return path.indexOf("\\Local Settings") !== -1;
        });
        
        var result = signingHelper.getKeyStorePath();
        expect(result).toContain("\\Local Settings");
    });
    
    it("can find keys in windows AppData", function () {
        spyOn(os, "type").andReturn("windows");
        
        spyOn(path, "existsSync").andCallFake(function (path) {
            return path.indexOf("\\AppData") !== -1;
        });
        
        var result = signingHelper.getKeyStorePath();
        expect(result).toContain("\\AppData");
    });
    
    it("returns a path on windows that specifies the drive", function () {
        process.env.HOMEPATH = "Users\\user";
        process.env.HOMEDRIVE = "C:";
        
        this.after = function() {
            delete process.env.HOMEPATH;
            delete process.env.HOMEDRIVE;
        };

        spyOn(os, "type").andReturn("windows");
        spyOn(path, "existsSync").andCallFake(function (p) {
            return p.indexOf("C:") !== -1;
        });

        var result = signingHelper.getKeyStorePath();
        expect(result).toContain("C:");
    });

    it("can find keys in windows on a different path", function () {
        process.env.HOMEPATH = "Users\\User";
        process.env.HOMEDRIVE = "D:";

        this.after = function() {
            delete process.env.HOMEPATH;
            delete process.env.HOMEDRIVE;
        };

        spyOn(os, "type").andReturn("windows");
        spyOn(path, "existsSync").andCallFake(function (path) {
            return path.indexOf("D:") !== -1;
        });

        var result = signingHelper.getKeyStorePath();
        expect(result).toContain("D:");
    });
    
    it("can find keys in the Mac Library folder", function () {
        spyOn(os, "type").andReturn("darwin");
        
        spyOn(path, "existsSync").andCallFake(function (path) {
            return path.indexOf("/Library/Research In Motion/") !== -1;
        });
        
        var result = signingHelper.getKeyStorePath();
        expect(result).toContain("/Library/Research In Motion/");
    });
    
    it("returns undefined on windows when keys cannot be found", function () {
        spyOn(os, "type").andReturn("windows");
        spyOn(path, "existsSync").andReturn(false);
        
        var result = signingHelper.getKeyStorePath();
        expect(result).toBeUndefined();
    });
    
    it("returns undefined on mac when keys cannot be found", function () {
        spyOn(os, "type").andReturn("darwin");
        spyOn(path, "existsSync").andReturn(false);
        
        var result = signingHelper.getKeyStorePath();
        expect(result).toBeUndefined();
    });
});
