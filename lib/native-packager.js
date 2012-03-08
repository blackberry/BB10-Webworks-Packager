var childProcess = require("child_process"),
    fs = require("fs"),
    path = require("path"),
    util = require("util"),
    data2xml = require("data2xml"),
    wrench = require("wrench"),
    conf = require("./conf"),
    logger = require("./logger"),
    localize = require("./localize"),
    pkgrUtils = require("./packager-utils"),
    NL = pkgrUtils.isWindows() ? "\r\n" : "\n";
    
function generateTabletXMLFile(session, config) {
    var xmlObject = {
        id : config.id,
        name : config.name,
        versionNumber : config.version,
        author : config.author,
        asset : {
            _attr : { entry : 'true', type : 'qnx/elf' },
            _value : 'wwe'
        },
        initialWindow : {
            systemChrome : 'none',
            transparent : 'true'
        },
        env : {
            _attr : { value : '12', var : 'WEBKIT_NUMBER_OF_BACKINGSTORE_TILES'}
        },
        permission : {
            _attr : { system : 'true'},
            _value : 'run_native'
        }
    };

    //Add description element if specifed
    if (config.description) {
        xmlObject.description = config.description;
    }

    //Add icon element if specified
    if (config.icon) {
        xmlObject.icon = {
            image: config.icon
        };
    }

    pkgrUtils.writeFile(session.sourceDir, "blackberry-tablet.xml", data2xml('qnx', xmlObject));
}

function generateOptionsFile(session, target) {
    var srcFiles = wrench.readdirSyncRecursive(session.sourceDir),
        optionsStr = "-package" + NL;

    optionsStr += path.resolve(util.format(session.barPath, target)) + NL;
    optionsStr += "-C" + NL;
    optionsStr += session.sourceDir + NL;	
    optionsStr += "blackberry-tablet.xml" + NL;

    srcFiles.forEach(function (file) {
        file = path.resolve(session.sourceDir, file);

        if (file.indexOf("blackberry-tablet.xml") < 0 && !fs.statSync(file).isDirectory()) {
            optionsStr += file + NL;
        }
    });

    fs.writeFileSync(path.normalize(session.sourceDir + "/options"), optionsStr);
}

function execNativePackager(session, callback) {
    var script = "/bin/blackberry-nativepackager",
        cwd = session.sourceDir,
        nativePkgr,
        msg;

    if (pkgrUtils.isWindows()) {
        script += ".bat";
    }

    nativePkgr = childProcess.spawn(path.normalize(conf.DEPENDENCIES_TOOLS + script), ["@options"], {
        "cwd": cwd,
        "env": process.env
    });

    nativePkgr.stdout.on("data", function (data) {
        logger.info(data.toString());
    });

    nativePkgr.stderr.on("data", function (data) {
        msg = data.toString();

        if (msg.toLowerCase().indexOf("warn") >= 0) {
            logger.warn(msg);
        } else {
            logger.error(msg);
        }
    });

    nativePkgr.on("exit", function (code) {
        if (callback && typeof callback === "function") {
            callback(code);
        }
    });
}

module.exports = {
    exec: function (session, target, config, callback) {
        generateOptionsFile(session, target);
        generateTabletXMLFile(session, config);
        execNativePackager(session, callback);
    }
};
