var Localize = require("localize"),
    loc = new Localize({
        "EXCEPTION_NATIVEPACKAGER": {
            "en": "Native Packager exception occurred"
        },
        "EXCEPTION_WIDGET_ARCHIVE_NOT_FOUND": {
            "en": "Failed to find WebWorks archive: $[1]"
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
            "en": "An error has occurred parsing the config.xml. Please ensure that it is syntactically correct."
        },
        "EXCEPTION_INVALID_VERSION": {
            "en": "Please enter a valid application version."
        },
        "EXCEPTION_INVALID_NAME": {
            "en": "Please enter a valid application name."
        },
        "EXCEPTION_INVALID_AUTHOR": {
            "en": "Please enter an author for the application."
        },
        "EXCEPTION_INVALID_ID": {
            "en": "Please enter a valid application id."
        },
        "EXCEPTION_INVALID_ICON_SRC": {
            "en": "Icon src cannot be null"
        }
        
    }, "", ""); // TODO maybe a bug in localize, must set default locale to "" in order get it to work

loc.setLocale("en");

module.exports = loc;
