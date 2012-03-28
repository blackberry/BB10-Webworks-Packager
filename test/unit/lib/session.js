var session = require(__dirname + "/../../../lib/session"),
    wrench = require("wrench");

describe("Session", function () {
    beforeEach(function () {
        //Do not create the source folder
        spyOn(wrench, "mkdirSyncRecursive");
    });
    
    it("sets the source directory correctly when specified [-s C:/sampleApp/mySource]", function () {
        var data = {
            args: [ 'C:\\sampleApp\\sample.zip' ],
            output: 'C:\\sampleApp\\bin',
            source: 'C:\\sampleApp\\mySource'//equivalent to [-s C:\\sampleApp\\mySource]
        },
        result = session.initialize(data);
        
        expect(result.sourceDir).toEqual("C:\\sampleApp\\mySource\\src");
    });
    
    it("sets the source directory correctly when unspecified [-s] and output path set [-o]", function () {
        var data = {
            args: [ 'C:\\sampleApp\\sample.zip' ],
            output: 'C:\\sampleApp\\bin',
            source: true//equivalent to [-s]
        },
        result = session.initialize(data);
        
        //src folder should be created in output directory
        expect(result.sourceDir).toEqual("C:\\sampleApp\\bin\\src");
    });
    
    it("sets the source directory correctly when unspecified [-s] and no output path is set", function () {
        var data = {
            args: [ 'C:\\sampleApp\\sample.zip' ],
            source: true//equivalent to [-s]
        },
        result = session.initialize(data);
        
        //src folder should be created in output directory
        expect(result.sourceDir).toEqual("C:\\sampleApp\\src");
    });
});
