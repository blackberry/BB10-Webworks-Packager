var path = require('path'),
    os = require('os'),
    localize = require("./localize"),
    authorP12 = "author.p12",
    sigtoolP12 = "sigtool.p12",
    _self;

function getKeyStoreDefaultPath() {
    // The default location where keystore is will vary based on the OS:
    // Windows XP: %HOMEPATH%\Local Settings\Application Data\Research In Motion
    // Windows Vista and Windows 7: %HOMEPATH%\AppData\Local\Research In Motion
    // Mac OS: ~/Library/Research In Motion
    // UNIX or Linux: ~/.rim
    var p = "";
    if (os.type().toLowerCase().indexOf("windows") >= 0) {
        // Try Windows XP location
        p = process.env.HOMEPATH + "\\Local Settings\\Application Data\\Research In Motion\\" + sigtoolP12;
        if (path.existsSync(p)) {
            return p;
        }

        // Try Windows Vista and Windows 7 location
        p = process.env.HOMEPATH + "\\AppData\\Local\\Research In Motion\\" + sigtoolP12;
        if (path.existsSync(p)) {
            return p;
        }
    } else if (os.type().toLowerCase().indexOf("darwin") >= 0) {
        // Try Mac OS location
        p = "~/Library/Research In Motion/" + sigtoolP12;
        if (path.existsSync(p)) {
            return p;
        }
    }

    throw localize.translate("EXCEPTION_MISSING_SIGNING_KEYS");
}

_self = {
    getKeyStorePath : function () {
        // Todo: decide where to put sigtool.p12 which is genereated and used in WebWorks SDK for Tablet OS
        return getKeyStoreDefaultPath();
    }
};

module.exports = _self;
