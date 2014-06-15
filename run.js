console.log("GlobalsDB-Admin is starting...");

var server,
    config,
    fs = require("fs");

try {
    config = require("./config.js");
} catch (e) {
    console.error("Unable to start: invalid configuration file config.js");
    console.error(e);
    process.exit(1);
}

// set config global
config.system = {
    cwd: __dirname
};

// try to load GlobalsDB module
try {
    require(config.database.modulePath);
} catch (e) {
    console.error("Unable to load cache node module. Check if correct module configured.\n", e);
    process.exit(1);
}

// check databases
var ds = config.database.databases,
    i = 0;

for (var d in ds) {
    if (!ds.hasOwnProperty(d)) continue;
    if (!fs.existsSync(ds[d] + "/CACHE.DAT")) { // "simple" check
        console.error("Configured database " + d + " (" + ds[d]
            + ") does not exists or is not a valid Caché database (missed CACHE.DAT)");
        delete ds[d];
    } else {
        i++;
    }
}

if (i === 0) {
    console.error("Unable to start: no configured databases. " +
        "Please, edit config.database.databases");
    process.exit(1);
}

// try to connect server
try {
    server = require("./server/index.js");
} catch (e) {
    console.error("Unable to start: problems with server/index.js\n", e);
    process.exit(1);
}

// set basic in-app exception handler
process.on("uncaughtException", function(err) {
    fs.appendFile(config.system.cwd + "/" + config.server.logFileName,
        "INTERNAL ERROR OCCURRED: " + err + "\n");
});

// init server
server.init(function(ok) {
    if (ok) {
        console.log("System start successful. Everything ready!");
    } else {
        console.error("Unable to start: server not up.") ;
    }
});