var cmd = require("commander"),
    logger = require("./logger");

cmd
    .version('1.0.0.0')
    .usage('[drive:][path]archive [-s [dir]] [[-gcsk cskpassword -gp12 p12password | -g genpassword] [-buildIdnum]] [-o dir] [-d]')
    .option('-s, --source [dir]', 'Save source. The default behaviour is to not save the source files. If dir is specified then creates dir\\src\\ directory structure. If no dir specified then the path of archive is assumed')
    .option('-o, --output <dir>', 'Redirects output file location to dir. If both -o and dir are not specified then the path of archive is assumed')
    .option('-v, --verbose', 'Turn on verbose messages');

if (!process.argv[2]) {
    //no args passed into [node bbwp.js], show the help information
    logger.info(cmd.helpInformation());
    process.exit();
}
    
module.exports = cmd;
