let fs = require('fs');

/*
 * Defines a map from commonly used file names (not absolute or relative file paths)
 * to an environment variable name.
 *
 * If we want to load this file and the corresponding environment variable is set
 * to a valid filepath, we should use that filepath instead of the default relative one.
 */
const CONFIG_ENV_ALTERNATIVES = {
    "config.js": {
        "config.yaml": "CYTUBE_CONFIG_YAML_LOCATION"
    },
    "logger.js": {
        "sys.log":     "CYTUBE_SYSLOG_LOCATION",
        "error.log":   "CYTUBE_ERRLOG_LOCATION",
        "events.log":  "CYTUBE_EVTLOG_LOCATION"
    },
    "web/webserver.js": {
        "http.log":    "CYTUBE_WEB_HTTPLOG_LOCATION",
        "cache":       "CYTUBE_WEB_CACHE_DIR",
    },
    "channel/channel.js": {
        "chanlogs":    "CYTUBE_CHANLOGS_DIR"
    },
    "ffmpeg.js": {
        "ffmpeg.log": "CYTUBE_FFMPEGLOG_LOCATION"
    },
};

CONFIG_ENV_ALTERNATIVES["web/acp.js"]["sys.log"] = CONFIG_ENV_ALTERNATIVES["logger.js"]["sys.log"];
CONFIG_ENV_ALTERNATIVES["web/acp.js"]["error.log"] = CONFIG_ENV_ALTERNATIVES["logger.js"]["error.log"];
CONFIG_ENV_ALTERNATIVES["web/acp.js"]["events.log"] = CONFIG_ENV_ALTERNATIVES["logger.js"]["events.log"];
CONFIG_ENV_ALTERNATIVES["web/acp.js"]["http.log"] = CONFIG_ENV_ALTERNATIVES["web/webserver.js"]["http.log"];
CONFIG_ENV_ALTERNATIVES["web/acp.js"]["chanlogs"] = CONFIG_ENV_ALTERNATIVES["channel/channel.js"]["chanlogs"];
CONFIG_ENV_ALTERNATIVES["server.js"]["chanlogs"] = CONFIG_ENV_ALTERNATIVES["channel/channel.js"]["chanlogs"];
CONFIG_ENV_ALTERNATIVES["setuid.js"]["chanlogs"] = CONFIG_ENV_ALTERNATIVES["channel/channel.js"]["chanlogs"];

function envVarFilenameOK(envVarName) {
    if (process.env(envVarName) != null) {
        let fileLocation = process.env[envVarName];

        if (fs.existsSync(fileLocation)) {
            return fileLocation;
        }
    }

    return null;
}

function checkEnvVars() {
    return Object.fromEntries(
        Object.entries(CONFIG_ENV_ALTERNATIVES)
        .map(([moduleName, filenameEnvMap]) => {
            return [moduleName,
                Object.fromEntries(
                    Object.entries(filenameEnvMap)
                    .map(([configFile, envVarName]) => {
                        return [configFile, envVarFilenameOK(envVarName)];
                    })
                )];
        })
    );
}

const KNOWN_ALTERNATIVES = checkEnvVars();

function tryFromEnv(moduleName, configFileName, defaultPath) {
    let filepath = KNOWN_ALTERNATIVES[moduleName][configFileName];

    if (filepath != null) {
        return filepath;
    } else {
        return defaultPath;
    }
}

module.exports = {
    tryFromEnv
};
