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
    "google2vtt.js": {
        "google-drive-subtitles": "CYTUBE_GOOGLE_DRIVE_SUBTITLES_DIR"
    }
};

CONFIG_ENV_ALTERNATIVES["web/acp.js"] = {
    "sys.log":    CONFIG_ENV_ALTERNATIVES["logger.js"]["sys.log"],
    "error.log":  CONFIG_ENV_ALTERNATIVES["logger.js"]["error.log"],
    "events.log": CONFIG_ENV_ALTERNATIVES["logger.js"]["events.log"],
    "http.log":   CONFIG_ENV_ALTERNATIVES["web/webserver.js"]["http.log"],
    "chanlogs":   CONFIG_ENV_ALTERNATIVES["channel/channel.js"]["chanlogs"]
};

CONFIG_ENV_ALTERNATIVES["server.js"] = {
    "chanlogs": CONFIG_ENV_ALTERNATIVES["channel/channel.js"]["chanlogs"],
    "google-drive-subtitles": CONFIG_ENV_ALTERNATIVES["google2vtt.js"]["google-drive-subtitles"]
};

CONFIG_ENV_ALTERNATIVES["setuid.js"] = {
    "chanlogs": CONFIG_ENV_ALTERNATIVES["channel/channel.js"]["chanlogs"],
    "google-drive-subtitles": CONFIG_ENV_ALTERNATIVES["google2vtt.js"]["google-drive-subtitles"]
};

function envVarFilenameOK(envVarName) {
    console.log("envVarFilenameOK:", envVarName);
    if (process.env[envVarName] != null) {
        console.log("envVarFilenameOK - process.env has this varname");
        let fileLocation = process.env[envVarName];

        if (fs.existsSync(fileLocation)) {
            return fileLocation;
        } else {
            console.log("File does not exist. attmpting creation");
            try {
                fs.writeFileSync(fileLocation, "");
                console.log(fileLocation, "created ok!");
                return fileLocation;
            } catch (e) {
                console.log(fileLocation, "ERROR CREATING:");
                console.error(e);
            }
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

Object.entries(KNOWN_ALTERNATIVES)
    .forEach(([moduleName, filenameEnvMap]) => {
        Object.entries(filenameEnvMap)
            .forEach(([configFile, envVarValue]) => {
                console.log(moduleName, configFile, envVarValue);
            })
    });

function tryFromEnv(moduleName, configFileName, defaultPath) {
    let filepath = KNOWN_ALTERNATIVES[moduleName][configFileName];
    console.log("tryFromEnv:", moduleName, configFileName, filepath);

    if (filepath != null) {
        return filepath;
    } else {
        return defaultPath;
    }
}

module.exports = {
    tryFromEnv
};
