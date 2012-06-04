/*
 *  Copyright 2012 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var cmd = require("commander"),
    logger = require("./logger");

cmd
    .version('1.0.0.0')
    .usage('[drive:][path]archive [-s [dir]] [[ -g genpassword] [-buildId num]] [-o dir] [-d]')
    .option('-s, --source [dir]', 'Save source. The default behaviour is to not save the source files. If dir is specified then creates dir\\src\\ directory structure. If no dir specified then the path of archive is assumed')
    .option('-g, --password <password>', 'Signing key password')
    .option('-buildId <num>', '[deprecated] Use --buildId.')
    .option('-b, --buildId <num>', 'Specifies the build number for signing (typically incremented from previous signing).')
    .option('-o, --output <dir>', 'Redirects output file location to dir. If both -o and dir are not specified then the path of archive is assumed')
    .option('-d, --debug', 'Allows use of not signed build on device by utilizing debug token and enables Web Inspector.')
    .option('-v, --verbose', 'Turn on verbose messages');

if (!process.argv[2]) {
    //no args passed into [node bbwp.js], show the help information
    process.argv.push("-h");
}

//Handle deprecated option -buildId
for (var i = 0; i < process.argv.length; i++) {
    if (process.argv[i] === "-buildId") {
        process.argv[i] = "--buildId";
    }
}
    
module.exports = cmd;
