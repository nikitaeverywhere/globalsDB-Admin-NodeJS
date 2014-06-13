var server,
    config,
    fs = require("fs");

console.log("GlobalsDB-Admin is starting...");

try {
    config = require("./config.js");
} catch (e) {
    console.log("Unable to start: invalid configuration file config.js");
    console.error(e);
    process.exit(1);
}

// set config global
config.system = {
    cwd: __dirname
};

// check databases
var ds = config.database.databases,
    i = 0;

for (var d in ds) {
    if (!ds.hasOwnProperty(d)) continue;
    if (!fs.existsSync(ds[d] + "/data/CACHE.DAT")) { // "simple" check
        console.error("Configured database " + d + " (" + ds[d]
            + ") does not exists or is not a valid GLOBALS database (missed data/CACHE.DAT)");
        delete ds[d];
    } else {
        i++;
    }
}

if (i === 0) {
    console.log("Unable to start: no configured databases. " +
        "Please, edit config.database.databases");
    process.exit(1);
}

try {
    server = require("./server/index.js");
} catch (e) {
    console.log("Unable to start: invalid module server/index.js");
    console.error(e);
    process.exit(1);
}

// set basic in-app exception handler
process.on("uncaughtException", function(err) {
    fs.appendFile(config.system.cwd + "/" + config.server.logFileName,
        "INTERNAL ERROR OCCURRED: " + err + "\n");
});

server.init(function(ok) {
    if (ok) {
        console.log("System start successful. Everything ready!");
    } else {
        console.error("Unable to start: server not up.") ;
    }
});