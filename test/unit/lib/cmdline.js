var srcPath = __dirname + "/../../../lib/",
    cmd;

describe("Command line", function () {
    beforeEach(function () {
        cmd = require(srcPath + "cmdline");
    });

    it("accepts -o with argument", function () {
        cmd.parseOptions(["-o", "outdir"]);
        expect(cmd.output).toEqual("outdir");
    });

    it("arg following -o is required", function () {
        spyOn(process, "exit");
        spyOn(console, "error");
        cmd.parseOptions(["-o"]);
        expect(process.exit).toHaveBeenCalled();
    });

    it("accepts -s without argument", function () {
        cmd.parseOptions(["-s"]);
        expect(cmd.source).toBeTruthy();
    });

    it("accepts -s with argument", function () {
        cmd.parseOptions(["-s", "mySourceDir"]);
        expect(cmd.source).toEqual("mySourceDir");
    });

    it("accepts -v", function () {
        cmd.parseOptions(["-v"]);
        expect(cmd.verbose).toBeTruthy();
    });
});
