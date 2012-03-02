var testData = require("./test-data"),
    configParser = require(testData.libPath + "/config-parser"),
    testUtilities = require("./test-utilities"),
    path = require("path"),
    configPath = path.resolve("test/config.xml");

describe("xml parser", function () {
    it("parses standard elements in a config.xml", function () {
        configParser.parse(configPath, function (configObj) {
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
    
    it("parses Feature elements in a config.xml", function () {
        var localAccessList,
            accessListFeature;

        configParser.parse(configPath, function (configObj) {
            //validate WIDGET_LOCAL accessList
            localAccessList = testUtilities.getAccessListForUri(configObj.accessList, "WIDGET_LOCAL");
            expect(localAccessList).toBeDefined();
            expect(localAccessList.uri).toEqual("WIDGET_LOCAL");
            expect(localAccessList.allowSubDomain).toEqual(true);
            
            //validate WIDGET_LOCAL feature [blackberry.app]
            accessListFeature = testUtilities.getFeatureByID(localAccessList.features, "blackberry.app");
            expect(accessListFeature).toBeDefined();
            expect(accessListFeature.id).toEqual("blackberry.app");
            expect(accessListFeature.required).toEqual(true);
            expect(accessListFeature.version).toEqual("1.0.0.0");
            
            //validate WIDGET_LOCAL feature [blackberry.system]
            accessListFeature = testUtilities.getFeatureByID(localAccessList.features, "blackberry.system");
            expect(accessListFeature).toBeDefined();
            expect(accessListFeature.id).toEqual("blackberry.system");
            expect(accessListFeature.required).toEqual(true);
            expect(accessListFeature.version).toEqual("1.0.0.3");
        });
    });
    
    it("parses Access elements a config.xml", function () {
        var customAccessList,
            accessListFeature;

        configParser.parse(configPath, function (configObj) {
            //validate http://www.somedomain1.com accessList
            customAccessList = testUtilities.getAccessListForUri(configObj.accessList, "http://www.somedomain1.com");
            expect(customAccessList).toBeDefined();
            expect(customAccessList.uri).toEqual("http://www.somedomain1.com");
            expect(customAccessList.allowSubDomain).toEqual(true);
            
            //validate http://www.somedomain1.com feature [blackberry.app]
            accessListFeature = testUtilities.getFeatureByID(customAccessList.features, "blackberry.app");
            expect(accessListFeature).toBeDefined();
            expect(accessListFeature.id).toEqual("blackberry.app");
            expect(accessListFeature.required).toEqual(true);
            expect(accessListFeature.version).toEqual("1.0.0.0");
            
            //validate http://www.somedomain1.com feature [blackberry.app.event]
            accessListFeature = testUtilities.getFeatureByID(customAccessList.features, "blackberry.app.event");
            expect(accessListFeature).toBeDefined();
            expect(accessListFeature.id).toEqual("blackberry.app.event");
            expect(accessListFeature.required).toEqual(false);
            expect(accessListFeature.version).toEqual("2.0.0.0");
        });
    });

    it("parses a bare minimum config.xml without error", function () {
        configPath = path.resolve("test/config-bare-minimum.xml");

        configParser.parse(configPath, function (configObj) {
            expect(configObj.content).toEqual("local:///startPage.html");
            expect(configObj.version).toEqual("1.0.0");
        });
    });
});