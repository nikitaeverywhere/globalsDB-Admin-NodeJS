module.exports = new function() {

    var express = null,
        app = null,
        config = require("./../config"),
        database = require("./database.js"),
        webSocketInterface = require("./socketInterface.js");

    /**
     * Initializes server and returns if success.
     *
     * @param {function=} callback
     */
    this.init = function(callback) {

        webSocketInterface.init(function() {

            if (config.localClient.enabled) {

                var dir;

                express = require("express");
                app = express();
                app.use(express.static(dir = config.system.cwd.replace(/\\/g, "/") + "/"
                    + config.localClient.directory));
                app.listen(config.localClient.port);

                console.log("Local http server started at port " + config.localClient.port
                    + " and serving " + dir);

            }

            if (typeof callback === "function") callback(true);

        });

    };

};
