/**
 * GlobalsDB module adapter.
 */
module.exports = function() {

    var config = require("./../config.js"),
        globals,
        db;

    /**
     *
     * @param parameters {{path: String, username: String, password: String, namespace: String}}
     * @param handler
     */
    this.open = function(parameters, handler) {

        db.open(parameters, function() {
            handler(false, { error: false });
        });

    };

    this.close = function(handler) {

        db.close(handler);

    };

    this.freeRequest = function(data, handler) {

        try {
            db[data.function].apply(db, data.arguments.push(handler));
        } catch (e) {
            handler.call({
                error: e
            })
        }

    };

    /**
     * Returns the list of nodes in current level.
     *
     * @param options
     * @param handler
     */
    this.getLevel = function(options, handler) {

        if (!(options.pathArray instanceof Array) || !options.pathArray.length) {
            db.global_directory({
                lo: options.lo,
                max: options.max
            }, handler);
        } else {
            db.retrieve({
                global: options.pathArray.splice(0, 1),
                subscripts: options.pathArray,
                lo: options.lo,
                max: options.max
            }, "list", handler);
        }

    };

    this.retrieveList = function(pathArray, handler) {

        db.retrieve({
            global: pathArray.splice(0, 1),
            subscripts: pathArray
        }, handler);

    };

    this.setNode = function(pathArray, data, handler) {

        db.set({
            global: pathArray.splice(0, 1),
            subscripts: pathArray,
            data: data
        }, handler);

    };

    this.getNode = function(pathArray, handler) {

        db.get({
            global: pathArray.splice(0, 1),
            subscripts: pathArray
        }, handler);

    };

    this.kill = function(pathArray, handler) {

        db.kill({
            global: pathArray.splice(0, 1),
            subscripts: pathArray
        }, handler);

    };

    this.about = function(handler) {

        db.about(handler);

    };

    this.init = function() {

        try {
            globals = require(config.database.modulePath);
            db = new globals.Cache();
        } catch (e) {
            console.error(e, "Cannot join globals module " + config.database.modulePath);
            process.exit(4);
        }

        delete this.init;

    };

};