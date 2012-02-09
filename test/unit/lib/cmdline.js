var srcPath = __dirname + "/../../../lib/",
    cmd = require(srcPath + "cmdline");

describe("Command line", function () {
    it("accepts -o with argument", function () {
        cmd.parseOptions(["-o", "outdir"]);
        expect(cmd.output).toEqual("outdir");
    });

    xit("arg following -o is required", function () {
        // TODO this causes the process to exit, how do I verify the result?!
        cmd.parseOptions(["-o"]);
        console.log("+++ do you see me");
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
