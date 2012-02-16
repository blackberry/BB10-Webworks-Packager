var testData = require("./test-data"),
    xmlParser = require(testData.libPath + "/xml-parser"),
    path = require("path");

describe("xml parser", function () {
    it("parses a config.xml", function () {
        xmlParser.parse(testData.configPath, function (configObj) {
            expect(configObj.content).toEqual("local:///startPage.html");
            expect(configObj.version).toEqual("1.0.0");
            expect(configObj.foregroundSource).toEqual("local:///startPage.html");
            expect(configObj.icon).toEqual("test.png");
            expect(configObj.configXML).toEqual("config.xml");
        });
    });
});