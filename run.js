var server, config;

try {
    config = require("./config.js");
} catch (e) {
    console.log("Unable to launch: configuration file is broken.");
    console.error(e);
    process.exit(1);
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