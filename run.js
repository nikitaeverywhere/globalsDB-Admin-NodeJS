var server,
    config,
    fs = require("fs");

try {
    config = require("./config.js");
} catch (e) {
    console.log("Unable to launch: configuration file is broken.");
    console.error(e);
    process.exit(1);
}

// check databases
var ds = config.database.databases;
for (var d in ds) {
    if (!ds.hasOwnProperty(d)) continue;
    if (!fs.existsSync(ds[d] + "/data/CACHE.DAT")) {
        console.error("Configured database " + d + " (" + ds[d] + "/data/CACHE.DAT) does not exists.");
        delete ds[d];
    }
}

try {
    server = require("./server/index.js");
} catch (e) {
    console.log("Unable to start application.");
    console.error(e);
    process.exit(2);
}

//process.on('uncaughtException', server.handleError);

server.init();

console.log("Everything ready!");