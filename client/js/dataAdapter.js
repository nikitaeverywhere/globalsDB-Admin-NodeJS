var dataAdapter = new function() {

    var VALUE_PREFIX = "___$"; // special property prefix to store node value in JS object for GlobalsDB database.

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

    /**
     * This function is bind to application. Each call forces app to request data again for required nodes.
     * Also use this function for asynchronous data tree update: call it after update with appropriate path argument.
     *
     * @param path {Array} Where update happened. Array of type ["root", "loot", ...].
     * @overrides
     */
    this.updated = function(path) {};

    /**
     * Must return array of property names on the current data level.
     *
     * @param path {Array} Dimension. For example, [1, "obj", 15] represents call to OBJECT[1]["obj"][15]
     * [ @param from {Number|String} Property name to start return from. If not present, returns from beginning. ]
     * [ @param number {Number} Number of elements to return. If not present, return everything available. ]
     * @returns {Array}
     */
    this.getLevel = function(path, number, from) {

        var i = -1, obj = dataTree, arr = []; if (!number) number = Infinity;

        do { // get object from subscripts
            i++;
            if (path[i]) obj = obj[path[i]];
            if (typeof obj !== "object") obj = null;
        } while (path[i] && obj);

        for (var u in obj) { // return object properties list
            if (!obj.hasOwnProperty(u) || u === VALUE_PREFIX) continue;
            if (from) { if (u !== from) continue; else from = false }
            if (number > 0) { number--; arr.push(u); }
        }

        return arr;

    };

    /**
     * Must return current node value as a string.
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

        return (typeof obj === "object")?((typeof obj[VALUE_PREFIX] === "undefined")?"":obj[VALUE_PREFIX]):obj;

    };

    /**
     * Set the value in tree.
     *
     * @param path
     * @param value
     * @returns {boolean}
     */
    this.setTestValue = function(path, value) {

//        if (!(path instanceof Array)) return false;
//
//        var obj = dataTree,
//            i = 0;
//
//        while (path[i] && typeof obj === "object") {
//            if (typeof obj[path[i]] === "undefined") {
//                obj[path[i]] = {};
//            }
//            obj = obj[path[i]];
//            i++;
//        }
//
//        console.log(obj, dataTree);

        dataTree.root["test"] = {
            s1: "helllo!",
            100: "Man"
        };

        dataTree.root.people["test"] = {
            ___$: "helllo!"
        };

        console.log(dataTree);

        return true;

    };

};
