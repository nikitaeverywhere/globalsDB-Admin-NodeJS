var dataAdapter = new function() {

    var dataTree = {

        root: {
            people: {
                John: {
                    name: "John",
                    age: "18",
                    gender: 1
                },
                Lizi: {
                    name: "Lizi",
                    age: "19",
                    gender: 2
                },
                Katrin: {
                    name: "Katrin",
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
                }
            },
            loot: {
                box: "100",
                knife: "100"
            }
        }

    };

    /**
     * Must return array of property names on the current data level.
     *
     * @param subscripts {Array} Dimension. For example, [1, "obj", 15] represents call to OBJECT[1]["obj"][15]
     * [ @param from {Number|String} Property name to start return from. If not present, returns from beginning. ]
     * [ @param number {Number} Number of elements to return. If not present, return everything available. ]
     * @returns {Array}
     */
    this.getLevel = function(subscripts, from, number) {

        var i = -1, obj = dataTree, arr = []; if (!number) number = Infinity;

        do { // get object from subscripts
            i++;
            if (subscripts[i]) obj = obj[subscripts[i]];
            if (typeof obj !== "object") obj = null;
        } while (subscripts[i] && obj);

        for (i in obj) { // return object properties list
            if (!obj.hasOwnProperty(i)) continue;
            if (from) { if (i !== from) continue; else from = false }
            if (number > 0) { number--; arr.push(i); }
        }

        return arr;

    };

};
