var testData = require('./test-data'),
    signingHelper = require(testData.libPath + '/signing-helper'),
    localize = require(testData.libPath + '/localize'),
    path = require('path'),
    os = require('os'),
    properties = { 
        homepath: "",
        homedrive: ""
    };

describe("signing-helper", function () {

    describe("windows path to signing keys", function () {
        
        beforeEach(function () {
            
            if (typeof process.env.HOMEPATH === 'undefined') {
                properties.homepath = "delete";
            } else {
                properties.homepath = process.env.HOMEPATH;
            }

            if (typeof process.env.HOMEDRIVE === 'undefined') {
                properties.homedrive = "delete";
            } else {
                properties.homedrive = process.env.HOMEDRIVE;
            }
        });
        
        afterEach(function () {

            if (typeof process.env.HOMEPATH === 'string') {
                if (properties.homepath === 'delete') {
                    delete process.env.HOMEPATH;
                } else {
                    process.env.HOMEPATH = properties.homepath; 
                }
            }

            if (typeof process.env.HOMEDRIVE === 'string') {
                if (properties.homedrive === 'delete') {
                    delete process.env.HOMEDRIVE;
                } else {
                    process.env.HOMEDRIVE = properties.homedrive; 
                }
            }
        });

        it("contains Local Settings", function () {
            spyOn(os, "type").andReturn("windows");
            
            spyOn(path, "existsSync").andCallFake(function (path) {
                return path.indexOf("\\Local Settings") !== -1;
            });
            
            var result = signingHelper.getKeyStorePath();
            expect(result).toContain("\\Local Settings");
        });
        
        it("contains AppData", function () {
            spyOn(os, "type").andReturn("windows");
            
            spyOn(path, "existsSync").andCallFake(function (path) {
                return path.indexOf("\\AppData") !== -1;
            });
            
            var result = signingHelper.getKeyStorePath();
            expect(result).toContain("\\AppData");
        });
    
        it("contains the home path", function () {
            process.env.HOMEPATH = "Users\\user";
            process.env.HOMEDRIVE = "C:";

            spyOn(os, "type").andReturn("windows");
            spyOn(path, "existsSync").andCallFake(function (p) {
                return p.indexOf("C:") !== -1;
            });

            var result = signingHelper.getKeyStorePath();
            expect(result).toContain("C:");
        });

        it("specifies the drive", function () {

            process.env.HOMEPATH = "Users\\user";
            process.env.HOMEDRIVE = "C:";
            
            spyOn(os, "type").andReturn("windows");
            spyOn(path, "existsSync").andCallFake(function (p) {
                return p.indexOf("C:") !== -1;
            });

            var result = signingHelper.getKeyStorePath();
            expect(result).toContain("C:");
        });

        it("specifies a drive other than C", function () {
            process.env.HOMEPATH = "Users\\User";
            process.env.HOMEDRIVE = "D:";

            spyOn(os, "type").andReturn("windows");
            spyOn(path, "existsSync").andCallFake(function (path) {
                return path.indexOf("D:") !== -1;
            });

            var result = signingHelper.getKeyStorePath();
            expect(result).toContain("D:");
        });

        it("is undefined when keys cannot be found", function () {
            spyOn(os, "type").andReturn("windows");
            spyOn(path, "existsSync").andReturn(false);
            
            var result = signingHelper.getKeyStorePath();
            expect(result).toBeUndefined();
        });
    });

    describe("mac path to signing keys", function () {

        it("contains the Library folder", function () {
            spyOn(os, "type").andReturn("darwin");
            
            spyOn(path, "existsSync").andCallFake(function (path) {
                return path.indexOf("/Library/Research In Motion/") !== -1;
            });
            
            var result = signingHelper.getKeyStorePath();
            expect(result).toContain("/Library/Research In Motion/");
        });
        
        it("is undefined when keys cannot be found", function () {
            spyOn(os, "type").andReturn("darwin");
            spyOn(path, "existsSync").andReturn(false);
            
            var result = signingHelper.getKeyStorePath();
            expect(result).toBeUndefined();
        });
    });
});
