var session = require(__dirname + "/../../../lib/session"),
    path = require("path"),
    wrench = require("wrench"),
    zipLocation = __dirname + "/../../config.xml";

function mockResolve() {
    //Mocking resolve because of a weird issue where resolve would return an 
    //invalid path on Mac if it cannot find the directory (c:/ doesnt exist on mac)
    spyOn(path, "resolve").andCallFake(function (myPath) {
        return path.normalize(myPath);
    });
}
    
describe("Session", function () {
    beforeEach(function () {
        //Do not create the source folder
        spyOn(wrench, "mkdirSyncRecursive");
    });
    
    it("sets the source directory correctly when specified [-s C:/sampleApp/mySource]", function () {
        mockResolve();
        
        var data = {
            args: [ 'C:/sampleApp/sample.zip' ],
            output: 'C:/sampleApp/bin',
            source: 'C:/sampleApp/mySource'//equivalent to [-s C:/sampleApp/mySource]
        },
        result = session.initialize(data);
        
        expect(result.sourceDir).toEqual(path.normalize("C:/sampleApp/mySource/src"));
    });
    
    it("sets the source directory correctly when unspecified [-s] and output path set [-o]", function () {
        mockResolve();
        
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
        mockResolve();
        
        var data = {
            args: [ zipLocation ],
            source: true//equivalent to [-s]
        },
        result = session.initialize(data);
        
        //src folder should be created in output directory
        expect(result.sourceDir).toEqual(path.join(process.cwd(), "src"));
    });
    
    it("sets the password when specified using -g", function () {
        var data = {
            args: [ 'C:/sampleApp/sample.zip' ],
            output: 'C:/sampleApp/bin',
            source: 'C:/sampleApp/mySource',//equivalent to [-s C:/sampleApp/mySource]
            password: 'myPassword'
        },
        result = session.initialize(data);
        expect(result.storepass).toEqual('myPassword');
    });
    
    it("does not set the password when not a string", function () {
        //Commander somtimes improperly sets password to a function, when no value provided
        var data = {
            args: [ 'C:/sampleApp/sample.zip' ],
            output: 'C:/sampleApp/bin',
            source: 'C:/sampleApp/mySource',//equivalent to [-s C:/sampleApp/mySource]
            password: function () {}
        },
        result = session.initialize(data);
        expect(result.storepass).toBeUndefined();
    });
    
    it("sets the buildId when specified [-buildId]", function () {
        var data = {
            args: [ 'C:/sampleApp/sample.zip' ],
            output: 'C:/sampleApp/bin',
            source: 'C:/sampleApp/mySource',//equivalent to [-s C:/sampleApp/mySource]
            buildId: '100'
        },
        result = session.initialize(data);
        expect(result.buildId).toEqual('100');
    });
    
    it("sets the output directory correctly when specified with a relative path [-o myOutput]", function () {
        var bbwpDir = __dirname + "/../../../",
        data = {
            args: [ 'C:/sampleApp/sample.zip' ],
            output: 'myOutput',
        },
        result = session.initialize(data);
        
        //output should be set to bbwp location + outputFolder
        expect(result.outputDir).toEqual(path.normalize(path.join(bbwpDir, "myOutput")));
    });
});
