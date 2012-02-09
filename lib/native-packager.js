var child_process = require("child_process"),
    fs = require("fs"),
    os = require("os"),
    path = require("path"),
    wrench = require("wrench"),
    conf = require("./conf"),
    logger = require("./logger"),
    localize = require("./localize"),
    data2xml = require('data2xml'),
    packager_utils = require('./packager-utils'),
    NL = os.type().toLowerCase().indexOf("windows") >= 0 ? "\r\n" : "\n";

function generateTabletXMLFile(sourceDir, config) {
    var xmlObject = {
        id : config.id.replace(' ', ''),
        name : config.name,
        versionNumber : config.versionNumber,
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
    if( config.description != null) {
        xmlObject.description = config.description;
    }
    
    //Add icon element if specified
    if( config.image != null ) {
        xmlObject.icon = {
                image : config.image
            };
    }
    
    packager_utils.writeFile(sourceDir, "blackberry-tablet.xml", data2xml('qnx', xmlObject));
}

function generateOptionsFile(session) {
    var srcFiles = wrench.readdirSyncRecursive(session.sourceDir),
        optionsStr = "-package" + NL;

    optionsStr += session.barPath + NL;
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

function execNativePackager(session) {
    var script = "/bin/blackberry-nativepackager",
        cwd = session.sourceDir,
        nativePkgr,
        msg;

    // TODO move to utils
    if (os.type().toLowerCase().indexOf("windows") >= 0) {
        script += ".bat";
    }
/*
    if (!path.existsSync(cwd)) {
        wrench.mkdirSyncRecursive(cwd, "0755");
    }
*/

    nativePkgr = child_process.spawn(path.normalize(conf.DEPENDENCIES_TOOLS + script), ["@options"], {
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
        if (code !== 0) {
            throw localize.translate("EXCEPTION_NATIVEPACKAGER");
        }
    });
}

module.exports = {
    exec: function (session) {
        //TODO use real config Object
        var config = {
            id: 'Demo',
            name: 'Demo',
            versionNumber: '1.0.0',
            author: 'Research In Motion Ltd.',
            description: 'This is a test!',
            image: 'irisIcon.png'
        };
    
        generateOptionsFile(session);
        generateTabletXMLFile(session.sourceDir, config);
        execNativePackager(session);
    }
};
