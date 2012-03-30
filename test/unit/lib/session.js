var session = require(__dirname + "/../../../lib/session"),
    path = require("path"),
    wrench = require("wrench"),
    zipLocation = __dirname + "/../../config.xml";

describe("Session", function () {
    beforeEach(function () {
        //Do not create the source folder
        spyOn(wrench, "mkdirSyncRecursive");
    });
    
    it("sets the source directory correctly when specified [-s C:/sampleApp/mySource]", function () {
        var data = {
            args: [ 'C:/sampleApp/sample.zip' ],
            output: 'C:/sampleApp/bin',
            source: 'C:/sampleApp/mySource'//equivalent to [-s C:/sampleApp/mySource]
        },
        result = session.initialize(data);
        
        expect(result.sourceDir).toEqual(path.normalize("C:/sampleApp/mySource/src"));
    });
    
    it("sets the source directory correctly when unspecified [-s] and output path set [-o]", function () {
        var data = {
            args: [ 'C:/sampleApp/sample.zip' ],
            output: 'C:/sampleApp/bin',
            source: true//equivalent to [-s]
        },
        result = session.initialize(data);
        
        //src folder should be created in output directory
        expect(result.sourceDir).toEqual(path.normalize("C:/sampleApp/bin/src"));
    });
    
    it("sets the source directory correctly when unspecified [-s] and no output path is set", function () {
        var data = {
            args: [ zipLocation ],
            source: true//equivalent to [-s]
        },
        result = session.initialize(data);
        
        //src folder should be created in output directory
        expect(result.sourceDir).toEqual(path.join(path.dirname(zipLocation), "src"));
    });
});
