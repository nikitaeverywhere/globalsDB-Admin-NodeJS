module.exports = function() {

    var DB = require("./database.js"),
        db = null,
        LOGGED = false,
        DEFAULT_MAX = 500;

    var requests = {

        open: function(data, handler) {
            db.open(data, function(err, res) {
                if (!err) LOGGED = true;
                handler({
                    error: err,
                    result: res
                });
            });
        },

        close: function(data, handler) {
            db.close(function(err, res) {
                if (!err) LOGGED = false;
                handler({
                    error: err,
                    result: res
                });
            });
        },

        freeRequest: function(data, handler) {
            db.freeRequest(data, function() {
                handler({
                    result: arguments
                });
            })
        },

        getLevel: function(data, handler) {
            db.getLevel({
                pathArray: data.pathArray || [],
                lo: data.lo || "",
                max: data.max || DEFAULT_MAX
            }, function(error, result) {

                if (!error) {

                    for (var i = 0; i < result.length; i++) {
                        result[i] = {
                            name: result[i]
                        }
                    }
                }

                handler({
                    error: error,
                    result: result
                });

            });
        },

        getNode: function(data, handler) {
            db.getNode(data.pathArray || [], function(error, result) {
                handler({
                    error: error,
                    result: result
                });
            });
        },

        setNode: function(data, handler) {
            db.setNode(data.pathArray || [], data.data || "", function(error, result) {
                handler({
                    error: error,
                    result: result
                });
            });
        },

        killNode: function(data, handler) {
            db.kill(data.pathArray || ["trash", "die", "deadNode"], function(error, result) {
                handler({
                    error: error,
                    result: result
                })
            })
        },

        about: function(data, handler) {
            db.about(function(error, result) {
                handler({
                    error: error,
                    result: result
                })
            })
        },

        retrieveList: function(data, handler) {
            db.retrieveList(data.pathArray, function(error, result) {
                handler({
                    error: error,
                    result: result
                });
            });
        }

    };

    this.asynchronousRequest = function(object, handler) {

        if (object && object.request && requests.hasOwnProperty(object.request)) {
            requests[object.request](object.data || {}, function(data) {
                if (object.__id) data.__id = object.__id;
                handler(data);
            });
        } else handler({ error: "Request not recognised.", request: object });

    };

    this.getOpened = function() {
        return LOGGED;
    };

    var init = function() {

        db = new DB();
        db.init();

    };

    init();

};
