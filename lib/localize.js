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

var Localize = require("localize"),
    loc = new Localize({
        "EXCEPTION_NATIVEPACKAGER": {
            "en": "Native Packager exception occurred"
        },
        "EXCEPTION_WIDGET_ARCHIVE_NOT_FOUND": {
            "en": "Failed to find WebWorks archive: $[1]"
        },
        "EXCEPTION_MISSING_SIGNING_KEY_FILE": {
            "en": "Cannot sign application - failed to find signing key file: $[1]"
        },
        "WARNING_MISSING_SIGNING_KEY_FILE": {
            "en": "Build ID set in config.xml [version], but signing key file was not found: $[1]"
        },
        "EXCEPTION_MISSING_SIGNING_PASSWORD": {
            "en": "Cannot sign application - No signing password provided [-g]"
        },
        "WARNING_SIGNING_PASSWORD_EXPECTED": {
            "en": "Build ID set in config.xml [version], but no signing password was provided [-g]. Bar will be unsigned"
        },
        "EXCEPTION_MISSING_SIGNING_BUILDID": {
            "en": "Cannot sign application - No buildId provided [--buildId]"
        },
        "EXCEPTION_DEBUG_TOKEN_NOT_FOUND": {
            "en": "Failed to find debug token"
        },
        "EXCEPTION_DEBUG_TOKEN_WRONG_FILE_EXTENSION": {
            "en": "Specified debug token not a .bar extension"
        },
        "EXCEPTION_FEATURE_NOT_FOUND": {
            "en": "Failed to find feature with id: $[1]"
        },
        "EXCEPTION_MISSING_FILE_IN_API_DIR": {
            "en": "Failed to find \"$[1]\" in \"$[2]\""
        },
        "EXCEPTION_NON_JS_FILE_IN_API_DIR": {
            "en": "Non-JavaScript file found in API directory: $[1]"
        },
        "PROGRESS_SESSION_CONFIGXML": {
            "en": "Parsing config.xml"
        },
        "PROGRESS_FILE_POPULATING_SOURCE": {
            "en": "Populating application source"
        },
        "PROGRESS_GEN_OUTPUT": {
            "en": "Generating output files"
        },
        "PROGRESS_PACKAGING": {
            "en": "Packaging the BAR file"
        },
        "PROGRESS_COMPLETE": {
            "en": "BAR packaging complete"
        },
        "EXCEPTION_PARSING_XML": {
            "en": "An error has occurred parsing the config.xml. Please ensure that it is syntactically correct"
        },
        "EXCEPTION_INVALID_VERSION": {
            "en": "Please enter a valid application version"
        },
        "EXCEPTION_INVALID_NAME": {
            "en": "Please enter a valid application name"
        },
        "EXCEPTION_INVALID_AUTHOR": {
            "en": "Please enter an author for the application"
        },
        "EXCEPTION_INVALID_ID": {
            "en": "Please enter a valid application id"
        },
        "EXCEPTION_INVALID_ICON_SRC": {
            "en": "Icon src cannot be null"
        },
        "EXCEPTION_BUFFER_ERROR": {
            "en": "ERROR in bufferToString(): Buffer length must be even"
        },
        "EXCEPTION_FEATURE_DEFINED_WITH_WILDCARD_ACCESS_URI": {
            "en": "Invalid config.xml - no <feature> tags are allowed for this <access> element"
        },
        "EXCEPTION_INVALID_ACCESS_URI_NO_PROTOCOL": {
            "en": "Invalid URI attribute in the access element - protocol required($[1])"
        },
        "EXCEPTION_INVALID_ACCESS_URI_NO_URN": {
            "en": "Failed to parse the URI attribute in the access element($[1])"
        }
    }, "", ""); // TODO maybe a bug in localize, must set default locale to "" in order get it to work

loc.setLocale("en");

module.exports = loc;
