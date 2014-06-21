/**
 * GlobalsDB module adaptor.
 */
var config = require("./../config.js"),
    GlobalsModule = require(config.database.modulePath);

module.exports = function() {

    var db;

    /**
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
                global: options.pathArray.splice(0, 1)[0],
                subscripts: options.pathArray,
                lo: options.lo,
                max: options.max
            }, "list", handler);
        }

    };

    /**
     * Get a list of sub-nodes by given pathArray.
     *
     * @param pathArray
     * @param handler
     */
    this.retrieveList = function(pathArray, handler) {

        db.retrieve({
            global: pathArray.splice(0, 1)[0],
            subscripts: pathArray
        }, handler);

    };

    /**
     * Set node value.
     *
     * @param pathArray
     * @param data
     * @param handler
     */
    this.setNode = function(pathArray, data, handler) {

        db.set({
            global: pathArray.splice(0, 1)[0],
            subscripts: pathArray,
            data: data
        }, handler);

    };

    this.copy = function(fromPathArray, toPathArray, handler) {

        db.merge({
            to: {
                global: toPathArray.splice(0, 1)[0],
                subscripts: toPathArray
            },
            from: {
                global: fromPathArray.splice(0, 1)[0],
                subscripts: fromPathArray
            }
        }, handler);

    };

    /**
     * Get node value.
     *
     * @param pathArray
     * @param handler
     */
    this.getNode = function(pathArray, handler) {

        db.get({
            global: pathArray.splice(0, 1)[0],
            subscripts: pathArray
        }, handler);

    };

    /**
     * Delete node and all sub-nodes.
     *
     * @param pathArray
     * @param handler
     */
    this.kill = function(pathArray, handler) {

        db.kill({
            global: pathArray.splice(0, 1)[0],
            subscripts: pathArray
        }, handler);

    };

    /**
     * Get about information.
     *
     * @param handler
     */
    this.about = function(handler) {

        db.about(handler);

    };

    /**
     * Initialise when ready to connect to database.
     */
    this.init = function() {

        try {
            db = new GlobalsModule.Cache();
        } catch (e) {
            console.error(e, "Cannot join globals module " + config.database.modulePath);
            process.exit(4);
        }

        delete this.init;

    };

};