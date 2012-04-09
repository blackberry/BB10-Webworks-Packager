var srcPath = __dirname + "/../../../lib/",
    testData = require("./test-data"),
    testUtilities = require("./test-utilities"),
    localize = require(srcPath + "localize"),
    packagerValidator = require(srcPath + "packager-validator"),
    cmd;

describe("Packager Validator", function () {
    it("throws an exception when trying to sign and keys were not found", function () {
        var session = testUtilities.cloneObj(testData.session);
        session.storepass = "myPassword";
        session.keystore = undefined;
        
        expect(function () {
            packagerValidator.validateSession(session);
        }).toThrow(localize.translate("EXCEPTION_MISSING_SIGNING_KEYS"));
    });
});
