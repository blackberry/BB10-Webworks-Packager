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

var path = require("path");

module.exports = {
    ROOT: path.normalize(__dirname + "/../Framework"),
    BIN: path.normalize(__dirname + "/../Framework/bin"),
    LIB: path.normalize(__dirname + "/../Framework/lib"),
    EXT: path.normalize(__dirname + "/../Framework/ext"),
    UI: path.normalize(__dirname + "/../Framework/ui-resources"),
    DEPENDENCIES: path.normalize(__dirname + "/../Framework/dependencies"),
    DEPENDENCIES_BOOTSTRAP: path.normalize(__dirname + "/../Framework/dependencies/bootstrap"),
    DEPENDENCIES_TOOLS: path.normalize(__dirname + "/../dependencies/tools"),
    DEPENDENCIES_EMU: path.normalize(__dirname + "/../Framework/dependencies/BBX-Emulator"),
    DEPENDENCIES_WWE: path.normalize(__dirname + "/../dependencies/%s-wwe"),
    DEPENDENCIES_BAR: path.normalize(__dirname + "/../dependencies/bar-dependencies/%s"),
    DEBUG_TOKEN: path.normalize(__dirname + "/../debugtoken.bar"),
    DEFAULT_ICON: path.normalize(__dirname + "/../default-icon.png")
};
