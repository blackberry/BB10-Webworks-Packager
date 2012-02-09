var path = require("path");

module.exports = {
    ROOT: path.normalize(__dirname + "/../Framework"),
    BIN: path.normalize(__dirname + "/../Framework/bin"),
    LIB: path.normalize(__dirname + "/../Framework/lib"),
    EXT: path.normalize(__dirname + "/../Framework/ext"),
    DEPENDENCIES: path.normalize(__dirname + "/../Framework/dependencies"),
    DEPENDENCIES_BOOTSTRAP: path.normalize(__dirname + "/../Framework/dependencies/bootstrap"),
    DEPENDENCIES_TOOLS: path.normalize(__dirname + "/../dependencies/tools"),
    DEPENDENCIES_EMU: path.normalize(__dirname + "/../Framework/dependencies/BBX-Emulator"),
    DEPENDENCIES_WWE: path.normalize(__dirname + "/../dependencies/%s-wwe")
};
