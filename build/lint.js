/*
 *  Copyright 2011 Research In Motion Limited.
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
var utils = require('../Framework/build/build/utils'),
    wrench = require('wrench'),
    _c = require('./build/conf'),
    jWorkflow = require("jWorkflow"),
    fs = require('fs');

function _done(error) {
    if (error === undefined) {
        utils.displayOutput("Lint SUCCESS");
    } else {
        utils.displayOutput("Lint FAILED");
    }
    process.exit(error);
}

function _lintJS() {
    var options = ["--reporter", "build/lint/reporter.js", "--show-non-errors"],
        files = ["."];

    return utils.execCommandWithJWorkflow('jshint ' + files.concat(options).join(' '));
}

module.exports = function (files) {
    jWorkflow.order(_lintJS()).start(function (code) {
        _done(code);
    });
};
