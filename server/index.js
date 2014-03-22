module.exports = new function() {

    var express = require("express"),
        app = express(),
        config = require("./../config"),
        database = require("./database.js"),
        webSocketInterface = require("./socketInterface.js");

    this.init = function() {

        webSocketInterface.init();

        if (config.localClient.enabled) {
            app.use(express.static(config.system.cwd.replace(/\\/g, "/") + "/" + config.localClient.directory));
            app.listen(config.localClient.port);
            console.log("Client joined.");
        }

    };

    /*this.handleError = function(error) {

        if (error.code === "EADDRINUSE") {
            console.log("SERVER PORT = " + config.server.port);
            if (config.localClient.enabled) {
                console.log("CLIENT PORT = " + config.localClient.port +
                    (config.localClient.port == config.server.port)?" (unable to start client on same port)":"");
            }
            console.error("Error: ports is unavailable. Check config.js file.");
            process.exit(3);
        } else {
            console.error(error);
        }

    };*/

};
