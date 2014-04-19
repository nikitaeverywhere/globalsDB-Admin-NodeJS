var dataAdapter = new function() {

    var VALUE_PREFIX = "___$", // special property prefix to store node value in JS object for GlobalsDB database.

        _this = this; // ...

    var limits = {

        // pathHash = limited

    };

    var dataTree = { // @debug

        root: {
            ___$: "[ROOT]",
            control: {
                move: {
                    ___$: 1
                },
                test: 1,
                get: 1,
                set: 1,
                delete: 1
            },
            people: {
                John: {
                    name: "John",
                    age: "18",
                    gender: 1
                },
                Lizzie: {
                    name: "Lizzie",
                    age: "19",
                    gender: 2
                },
                Karin: {
                    name: "Karin",
                    age: "16",
                    gender: 2
                },
                Roger: {
                    name: "Roger",
                    age: "18",
                    gender: 1
                },
                Karl: {
                    name: "Karl",
                    age: "18",
                    gender: 1
                },
                Klara: {
                    name: "Klara",
                    age: "40",
                    gender: 2
                },
                Tree: {
                    name: "Tree",
                    age: "90",
                    gender: 0
                },
                Max: {
                    name: "Max",
                    age: "14",
                    gender: 1
                },
                Jim: {
                    name: "Jim",
                    age: "20",
                    gender: 1
                },
                Eli: {
                    name: "Eli",
                    age: "27",
                    gender: 2
                },
                Tod: {
                    name: "Tod",
                    age: "20",
                    gender: 1
                },
                Marco: {
                    name: "Marco",
                    age: "28",
                    gender: 1
                }
            },
            loot: {
                box: "100",
                knife: "100"
            },
            actions: {
                push: "1",
                pop: "2",
                task: "3",
                make: "4"
            },
            branches: {
                master: {
                    color: "red",
                    weight: 100
                }
            }
        }

    };

    var getTreeObjectByPath = function(path) { // including ["root", ...]

        var i = -1,
            obj = dataTree;

        do { // get object from subscripts
            i++;
            if (path[i]) obj = obj[path[i]];
            if (typeof obj !== "object") obj = null;
        } while (path[i] && obj);

        return obj;

    };

    var updateTreeSubLevel = function(path, subLevelName) {

        var treeObject = getTreeObjectByPath(path);

        if (!treeObject || !path || !subLevelName) {
            console.error("Wrong server data flow.");
            return;
        }

        if (!treeObject.hasOwnProperty(subLevelName)) {
            treeObject[subLevelName] = {};
        } else {
            // nothing to do
        }

    };

    var deleteTreeNode = function(path) {

        var treeObject = getTreeObjectByPath(path.slice(0, path.length - 1)),
            prop = path.pop();

        if (treeObject.hasOwnProperty(prop)) {
            delete treeObject[prop];
        } else {
            console.log("Unable to delete from tree ", path);
        }

    };

    var updateTreeValue = function(path, value) {

        var treeObject = getTreeObjectByPath(path);

        if (typeof treeObject === "object") {
            treeObject[VALUE_PREFIX] = value;
        } else {
            console.error("Make sure you're on a right way.");
        }

    };

    var serverAdapter = new function() {

        /**
         * Returns if data loading from server is complete.
         *
         * @param path
         */
        var completedLevel = function(path) {

            var hash = path.join(",");

            return limits.hasOwnProperty(hash);

        };

        var setCompleted = function(path) {

            var hash = path.join(",");

            limits[hash] = 1;

        };

        this.requestNodeValue = function(path) {

            //console.log("REQUESTING SERVER NODE VALUE", path);

            var realPath = path.slice(1);

            var req = {
                pathArray: realPath
            };

            server.send({
                request: "getNode",
                data: req
            }, function(data) {

                if (!data || data.error || !data.result) {
                    console.error("Sever data error: ", {
                        request: req,
                        data: data
                    });
                    return;
                }

                updateTreeValue(path, data.result.data);

                _this.nodeValueUpdated(realPath);

            });

        };

        this.requestLevelData = function(path, from) {

            // path = ["root", ..., ...]
            // from = "Name" || ""

            //console.log("REQUESTING SERVER LEVEL DATA FROM " + from, path);

            if (completedLevel(path)) return;

            var realPath = path.slice(1),
                i = 0;

            var req = {
                pathArray: realPath,
                max: 50
            };

            if (from) req.lo = from;

            server.send({
                request: "getLevel",
                data: req
            }, function(data) {

                if (!data || data.error || !data.result) {
                    console.error("Sever data error: ", data);
                    return;
                }

                for (var name in data.result) {
                    if (!data.result.hasOwnProperty(name)) continue;
                    updateTreeSubLevel(path, data.result[name].name);
                    i++;
                }

                if (i < req.max) { // data is limited
                    setCompleted(path);
                }

                _this.childUpdated(realPath);

            });

        }

    };

    /**
     * This function is bind to application. Each call forces app to request data again for required nodes.
     * Also use this function for asynchronous data tree update: call it after update with appropriate path argument.
     *
     * @param path {Array} Where update happened. Array without "root".
     * @overrides
     */
    this.childUpdated = function(path) {};

    this.nodeValueUpdated = function(path) {};

    /**
     * Must return array of property names on the current data level.
     *
     * @param path {Array} Dimension. For example, [1, "obj", 15] represents call to OBJECT[1]["obj"][15]
     * [ @param from {Number|String} Property name to start return from. If not present, returns from beginning. ]
     * [ @param number {Number} Number of elements to return. If not present, return everything available. ]
     * @returns {Array}
     */
    this.getLevel = function(path, number, from) {

        var i = -1,
            obj = dataTree,
            arr = [],
            u,
            lastProperty = "";

        if (!number) number = Infinity;

        do { // get object from subscripts
            i++;
            if (path[i]) obj = obj[path[i]];
            if (typeof obj !== "object") obj = null;
        } while (path[i] && obj);

        for (u in obj) { // return object properties list
            if (!obj.hasOwnProperty(u) || u === VALUE_PREFIX) continue;
            if (from) { if (u !== from) continue; else from = false; }
            if (number > 0) { number--; arr.push(u); lastProperty = u; } else { break; }
        }

        if (number > 0) serverAdapter.requestLevelData(path, lastProperty);

        return arr;

    };

    /**
     * Must return current node value as a string. Including [ "root", ... ]
     *
     * @param path {Array} For example, [1, "obj", 15] represents call to OBJECT[1]["obj"][15] value.
     * @returns {*}
     */
    this.getValue = function(path) {

        if (!(path instanceof Array)) return "";

        var obj = dataTree,
            i = 0;

        while (path[i] && typeof obj === "object") {
            obj = obj[path[i]];
            i++;
        }

        if (typeof obj === "object" && typeof obj[VALUE_PREFIX] === "undefined") serverAdapter.requestNodeValue(path);

        return (typeof obj === "object")?((typeof obj[VALUE_PREFIX] === "undefined")?"":obj[VALUE_PREFIX]):obj;

    };

    /**
     * Creates new node within given path. Path = [ "root", ... ]
     *
     * @param pathArray
     * @param nodeName
     * @param nodeValue "" if empty node
     * @param {function=} handler
     */
    this.setNode = function(pathArray, nodeName, nodeValue, handler) {

        var newPath = pathArray.concat(nodeName),
            realNewPath = newPath.slice(1);

        server.send({
            request: "setNode",
            data: {
                pathArray: realNewPath,
                data: nodeValue
            }
        }, function(response) {

            if (response && !response.error) {

                updateTreeSubLevel(pathArray, nodeName);
                updateTreeValue(newPath, nodeValue);
                _this.childUpdated(pathArray.slice(1));
                _this.nodeValueUpdated(realNewPath);
                if (typeof handler === "function") handler(true);

            } else {
                console.log("Wrong response", response);
                if (typeof handler === "function") handler(false);
            }

        });

    };

    /**
     * Deletes node and it's child within given path.
     *
     * @param {Array} pathArray - path to node to delete.
     * @param {function=} handler
     */
    this.deleteNode = function(pathArray, handler) {

        server.send({
            request: "killNode",
            data: {
                pathArray: pathArray.slice(1)
            }
        }, function(responce) {

            if (responce && !responce.error) {
                deleteTreeNode(pathArray);
                _this.childUpdated(pathArray.slice(1)); // don't ask me why
                if (typeof handler === "function") handler(true);
            } else {
                console.log("Wrong kill request.", responce);
                if (typeof handler === "function") handler(false);
            }

        });

    };

    this.getDataTree = function() {

        return dataTree;

    };

    /**
     * Clears the tree.
     */
    this.reset = function(baseName) {

        dataTree.root = {
            ___$: baseName || "root"
        };

    };

};
