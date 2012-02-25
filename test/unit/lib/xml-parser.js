var testData = require("./test-data"),
    xmlParser = require(testData.libPath + "/xml-parser"),
    testUtilities = require("./test-utilities"),
    path = require("path");

describe("xml parser", function () {
    it("parses a config.xml", function () {
        var configPath = path.resolve("test/config.xml"),
            localAccessList,
            bbAppFeature,
            bbSystemFeature;

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
            
            //validate WIDGET_LOCAL accessList
            localAccessList = testUtilities.getAccessListForUri(configObj.accessList, "WIDGET_LOCAL");
            expect(localAccessList).toBeDefined();
            expect(localAccessList.uri).toEqual("WIDGET_LOCAL");
            expect(localAccessList.allowSubDomain).toEqual(true);
            
            //validate WIDGET_LOCAL feature [blackberry.app]
            bbAppFeature = testUtilities.getFeatureByID(localAccessList.features, "blackberry.app");
            expect(bbAppFeature).toBeDefined();
            expect(bbAppFeature.id).toEqual("blackberry.app");
            expect(bbAppFeature.required).toBeTruthy();
            expect(bbAppFeature.version).toEqual("1.0.0.0");
            
            //validate WIDGET_LOCAL feature [blackberry.system]
            bbSystemFeature = testUtilities.getFeatureByID(localAccessList.features, "blackberry.system");
            expect(bbSystemFeature).toBeDefined();
            expect(bbSystemFeature.id).toEqual("blackberry.system");
            expect(bbSystemFeature.required).toBeTruthy();
            expect(bbSystemFeature.version).toEqual("1.0.0.3");
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