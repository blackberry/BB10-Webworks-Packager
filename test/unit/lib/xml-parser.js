var testData = require("./test-data"),
    xmlParser = require(testData.libPath + "/xml-parser"),
    path = require("path");

describe("xml parser", function () {
    it("parses a config.xml", function () {
        var configPath = path.resolve("test/config.xml");

        xmlParser.parse(configPath, function (configObj) {
            expect(configObj.content).toEqual("local:///startPage.html");
            expect(configObj.id).toEqual("MyWidgetId");
            expect(configObj.version).toEqual("1.0.0");
            expect(configObj.license).toEqual("My License");
            expect(configObj.licenseURL).toEqual("http://www.apache.org/licenses/LICENSE-2.0");
            expect(configObj.icon).toEqual("test.png");
            expect(configObj.configXML).toEqual("config.xml");
            expect(configObj.author).toEqual("Research In Motion Ltd.");
            expect(configObj.name).toEqual("Demo");
            expect(configObj.description).toEqual("This app does everything.");
        });
    });

    it("parses a bare minimum config.xml without error", function () {
        var configPath = path.resolve("test/config-bare-minimum.xml");

        xmlParser.parse(configPath, function (configObj) {
            expect(configObj.content).toEqual("local:///startPage.html");
            expect(configObj.version).toEqual("1.0.0");
        });
    });
});