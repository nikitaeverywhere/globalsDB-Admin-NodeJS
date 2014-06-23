var dataAdaptor = new function() {

    var VALUE_PREFIX = "___$", // special property prefix to store node value in JS object for GlobalsDB database.
        JUMPER_PREFIX = "___J",

        _this = this; // ...

    var limits = {

        // pathHash = limited

    };

    var dataTree = {

        root: {
            ___$: "Welcome!",
            Welcome: "Log in",
            To: "",
            The: "",
            Globals: "Please",
            Admin: ""
        }

    };

    var clearObject = function(path) {

        var name = path.slice().pop(),
            obj = getTreeObjectByPath(path.slice(0, path.length - 1));
        if (!obj) return;

        setCompleted(path, false);
        if (obj.hasOwnProperty(name)) {
            obj[name] = {};
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

    /**
     * Returns if data loading from server is complete.
     *
     * @param path
     */
    var completedLevel = function(path) {

        var hash = path.join(",");

        return limits.hasOwnProperty(hash);

    };

    var setCompleted = function(path, completed) {

        var hash = path.join(",");

        if (completed) {
            limits[hash] = 1;
        } else if (limits.hasOwnProperty(hash)) {
            delete limits[hash];
        }

        // check and remove child for non-completed nodes
        if (completed) return;
        for (var l in limits) {
            if (!limits.hasOwnProperty(l)) continue;
            if (l.indexOf(hash) === 0) delete limits[l];
        }

    };

    var serverAdapter = new function() {

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

            if (completedLevel(path)) {
                return;
            }

            var realPath = path.slice(1),
                i = 0;

            var req = {
                pathArray: realPath,
                max: 50
            };

            var to = getTreeObjectByPath(path);
            if (to.hasOwnProperty(JUMPER_PREFIX)) req.lo = to[JUMPER_PREFIX];
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
                    setCompleted(path, true);
                }

                _this.childUpdated(realPath);

            });

        }

    };

    /**
     * Clears node (removes child) from data tree without any server actions.
     */
    this.forceClear = function(path) {

        clearObject(path);
        setCompleted(path, false);
        _this.childUpdated(path.slice(1));

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
     * @param from {Number|String=} Property name to start return from. If not present, returns from beginning.
     * @param number {Number=} Number of elements to return. If not present, return everything available.
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
            if (!obj.hasOwnProperty(u) || u === VALUE_PREFIX || u === JUMPER_PREFIX) continue;
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
     * Copies source node content to destination path.
     *
     * @param {Array} sourcePathArray
     * @param {Array} destinationPathArray
     * @param {function=} handler
     */
    this.copyNode = function(sourcePathArray, destinationPathArray, handler) {

        var realSrcPathArr = sourcePathArray.slice(1),
            realDestPathArr = destinationPathArray.slice(1);

        server.send({
            request: "copyNode",
            data: {
                fromPathArray: realSrcPathArr,
                toPathArray: realDestPathArr
            }
        }, function(response) {

            if (response && !response.error) {

                updateTreeSubLevel(destinationPathArray.slice(0, destinationPathArray.length - 1),
                    destinationPathArray[destinationPathArray.length - 1]);
                _this.childUpdated(realDestPathArr.slice(0, realDestPathArr.length - 1));

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
        }, function(response) {

            if (response && !response.error) {
                deleteTreeNode(pathArray);
                _this.childUpdated(pathArray.slice(1)); // don't ask me why
                if (typeof handler === "function") handler(true);
            } else {
                console.log("Wrong kill request.", response);
                if (typeof handler === "function") handler(false);
            }

        });

    };

    /**
     * Jumper is the special floor-limiter, which forces dataAdaptor to request data from server
     * beginning from given node. If there are a huge number of nodes, jumper is required to get
     * the last node faster.
     *
     * @param {Array} pathArray - Path of type ["root", ...]
     * @param {String} nodeName - Node to jump to. Empty value will erase jumper.
     */
    this.setJumper = function(pathArray, nodeName) {

        var node = getTreeObjectByPath(pathArray);
        if (!node) return;

        setCompleted(pathArray, false);

        if (!nodeName) {
            if (node.hasOwnProperty(JUMPER_PREFIX)) delete node[JUMPER_PREFIX];
            clearObject(pathArray);
            _this.childUpdated(pathArray.slice(1));
        } else {
            clearObject(pathArray);
            node = getTreeObjectByPath(pathArray);
            node[JUMPER_PREFIX] = nodeName;
            _this.childUpdated(pathArray.slice(1));
        }

        //serverAdapter.requestLevelData(pathArray);

    };

    /**
     * Resets the tree and set up a base node name.
     *
     * @param {string="root"} baseName
     */
    this.reset = function(baseName) {

        dataTree.root = {
            ___$: baseName || "root"
        };
        limits = {};

    };

};
