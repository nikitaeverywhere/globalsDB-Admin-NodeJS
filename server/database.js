/**
 * GlobalsDB module adapter.
 * User: ZitRo
 * Date: 06.02.14
 * Time: 13:03
 * To change this template use File | Settings | File Templates.
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

        /*
        var gloArray = [];
        var sub = 0;
        gloArray[sub++] = {global: 'customer', subscripts: [1, "Address", 1], data: "San Diego"};
        gloArray[sub++] = {global: 'customer', subscripts: [1, "Address", 2], data: "USA"};
        gloArray[sub++] = {global: 'customer', subscripts: [1, "DateOfRegistration"], data: "1 June 2010"};
        gloArray[sub++] = {global: 'customer', subscripts: [1, "Name"], data: "Michael Pantaleo"};
        gloArray[sub++] = {global: 'customer', subscripts: [1, "Orders", 20100501, "Reference"], data: "Order001"};
        gloArray[sub++] = {global: 'customer', subscripts: [1, "Orders", 20100503, "Reference"], data: "Order002"};
        gloArray[sub++] = {global: 'customer', subscripts: [1, "Orders", 20100507, "Reference"], data: "Order003"};
        gloArray[sub++] = {global: 'customer', subscripts: [1, "Orders", 20100509, "Reference"], data: "Order004"};
        gloArray[sub++] = {global: 'customer', subscripts: [1, "Orders", 20100510, "Reference"], data: "Order005"};
        gloArray[sub++] = {global: 'customer', subscripts: [1, "Orders", 20100520, "Reference"], data: "Order006"};
        gloArray[sub++] = {global: 'customer', subscripts: [1, "Orders", 20100527, "Reference"], data: "Order007"};
        gloArray[sub++] = {global: 'customer', subscripts: [1, "Orders", 20100906, "Reference"], data: "Order008"};
        gloArray[sub++] = {global: 'customer', subscripts: [1, "Orders", 20110104, "Reference"], data: "Order011"};
        gloArray[sub++] = {global: 'customer', subscripts: [1, "Orders", 20110203, "Reference"], data: "Order012"};
        gloArray[sub++] = {global: 'customer', subscripts: [2, "Address", 1], data: "London"};
        gloArray[sub++] = {global: 'customer', subscripts: [2, "Address", 2], data: "UK"};
        gloArray[sub++] = {global: 'customer', subscripts: [2, "DateOfRegistration"], data: "1 May 2010"};
        gloArray[sub++] = {global: 'customer', subscripts: [2, "Name"], data: "Chris Munt"};
        gloArray[sub++] = {global: 'customer', subscripts: [2, "Orders", 20101204, "Reference"], data: "Order009"};
        gloArray[sub++] = {global: 'customer', subscripts: [2, "Orders", 20101206, "Reference"], data: "Order010"};
        gloArray[sub++] = {global: 'customer', subscripts: [3, "Address", 1], data: "Oxford"};
        gloArray[sub++] = {global: 'customer', subscripts: [3, "Address", 2], data: "UK"};
        gloArray[sub++] = {global: 'customer', subscripts: [3, "DateOfRegistration"], data: "9 June 2010"};
        gloArray[sub++] = {global: 'customer', subscripts: [3, "Name"], data: "Jane Smith"};
        gloArray[sub++] = {global: 'customer', subscripts: [4, "Name"], data: "Jim Cooper"};
        gloArray[sub++] = {global: 'customer', subscripts: [5, "Name"], data: "Eve Simpson"};
        gloArray[sub++] = {global: 'customer', subscripts: [6, "Name"], data: "John Cotton"};
        gloArray[sub++] = {global: 'customer', subscripts: [7, "Name"], data: "Alison Clarke"};
        gloArray[sub++] = {global: 'customer', subscripts: [8, "Name"], data: "Paul Francis"};
        gloArray[sub++] = {global: 'customer', subscripts: [9, "Name"], data: "Susan Reed"};
        gloArray[sub++] = {global: 'customer', subscripts: [10, "Name"], data: "Mary Dodds"};
        var result = db.update(gloArray, 'array');
        */

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

        var getValues = function(error, result) {
            if (error) { handler(error, result); return }

            var arr = [];

            var checkAll = function() {
                if (arr.length === result.length) {
                    handler(error, arr); // end
                }
            };

            var receiveResult = function(error, result) {
                result = result || { ok: 0, defined: 0, global: "undefined", data: "" };
                result.subscripts = [result.global];
                arr.push(result);
                checkAll();
            };

            for (var i = 0; i < result.length; i++) {
                db.get({
                    global: result[i],
                    subscripts: []
                }, receiveResult);
            }

            checkAll();

        };

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