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