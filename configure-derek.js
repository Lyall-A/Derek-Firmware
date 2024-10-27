const fs = require("fs");
const path = require("path");

const marlinPath = path.resolve(__dirname, "Marlin");
/**
 * name: Key in derek.config
 * file: Config file to change
 * replace: RegExp string to replace, @$ gets replaced with the new value
 */
const configOptions = [
    {
        name: "Z Offset",
        file: "Configuration.h",
        replace: "#define NOZZLE_TO_PROBE_OFFSET { .*, .*, @$ }"
    },
    {
        name: "E Steps",
        file: "Configuration.h",
        replace: "#define DEFAULT_AXIS_STEPS_PER_UNIT   { .*, .*, .*, @$ }"
    },
    {
        name: "Hotend kP",
        file: "Configuration.h",
        replace: "    #define DEFAULT_Kp  @$ \/\/"
    },
    {
        name: "Hotend kI",
        file: "Configuration.h",
        replace: "    #define DEFAULT_Ki   @$ \/\/"
    },
    {
        name: "Hotend kD",
        file: "Configuration.h",
        replace: "    #define DEFAULT_Kd  @$ \/\/"
    },
    {
        name: "Bed kP",
        file: "Configuration.h",
        replace: "  #define DEFAULT_bedKp @$ \/\/"
    },
    {
        name: "Bed kI",
        file: "Configuration.h",
        replace: "  #define DEFAULT_bedKi  @$ \/\/"
    },
    {
        name: "Bed kD",
        file: "Configuration.h",
        replace: "  #define DEFAULT_bedKd @$ \/\/"
    },
    {
        name: "Printing acceleration",
        file: "Configuration.h",
        replace: "#define DEFAULT_ACCELERATION          @$    \/\/"
    },
    {
        name: "Retract acceleration",
        file: "Configuration.h",
        replace: "#define DEFAULT_RETRACT_ACCELERATION  @$    \/\/"
    },
    {
        name: "Travel acceleration",
        file: "Configuration.h",
        replace: "#define DEFAULT_TRAVEL_ACCELERATION   @$    \/\/"
    },
    {
        name: "X maximum acceleration",
        file: "Configuration.h",
        replace: "#define DEFAULT_MAX_ACCELERATION      { @$, .*, .*, .* }"
    },
    {
        name: "Y maximum acceleration",
        file: "Configuration.h",
        replace: "#define DEFAULT_MAX_ACCELERATION      { .*, @$, .*, .* }"
    },
    {
        name: "Z maximum acceleration",
        file: "Configuration.h",
        replace: "#define DEFAULT_MAX_ACCELERATION      { .*, .*, @$, .* }"
    },
    {
        name: "E maximum acceleration",
        file: "Configuration.h",
        replace: "#define DEFAULT_MAX_ACCELERATION      { .*, .*, .*, @$ }"
    },
];

const config = fs.readFileSync(path.resolve(__dirname, "derek.config"), "utf-8");

for (const option of configOptions) {
    const value = config.match(new RegExp(`${escapeRegExp(option.name)} ?= ?(.*)`))?.[1]; // Get config value
    if (!value) continue; // Continue if no value
    const filePath = path.join(marlinPath, option.file); // Config file path
    const [beforeString, afterString] = option.replace.split("@$");
    const replaceRegex = new RegExp(`^(${beforeString}).*(${afterString})`, "m"); // Make replace regex

    const file = fs.readFileSync(filePath, "utf-8"); // Read config file
    const beforeMatch = file.match(replaceRegex); // Check for line that matches regex BEFORE replacing
    if (!beforeMatch) {
        console.log(`Couldn't find line that matches '${option.replace}' in config file '${option.file}'!`);
        continue;
    }

    const changedFile = file.replace(replaceRegex, (match, before, after) => `${before}${value}${after}`); // Replace config file

    const afterMatch = changedFile.match(replaceRegex); // Check for line that matches regex AFTER replacing
    if (!afterMatch) {
        console.log(`Couldn't match '${option.replace}' after replacing line!`);
    } else {
        console.log(afterMatch[0])
        // continue;
        fs.writeFileSync(`${filePath}.bak`, file);
        fs.writeFileSync(filePath, changedFile);
        console.log(`Replaced '${beforeMatch[0]}' to '${afterMatch[0]}' in config file '${option.file}'`);
    }
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}