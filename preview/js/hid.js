/**
 * Human input device wrapper object.
 *
 * Version: 0.5
 */
var hid = new function() {

    var specVar = "!hid", // special variable name that will be handled by html-objects
        pointer = { // pointer object
            stack: {

            },
            STATES: {
                NONE: 0,
                PRESS: 1,
                MOVE: 2,
                RELEASE: 3
            }
        },
        handled = {
            // [key][value]
        };

    var generateHandleKey = function() {
        var key;
        do {
            key = parseInt(Math.random().toString().substr(2));
        } while (handled.hasOwnProperty(key));
        return key;
    };

    // updates pointer
    var updatePointer = function(id, pointerObject) {
        if (!pointer.stack.hasOwnProperty(id)) return;
        for (var prop in pointerObject) {
            if (!pointerObject.hasOwnProperty(prop)) continue;
            pointer.stack[id][prop] = pointerObject[prop];
        }
    };

    // @debug
    this.getInner = function() { return pointer };

    // removes pointer
    var removePointer = function(id) {
        if (!pointer.stack.hasOwnProperty(id)) return;
        delete pointer.stack[id];
    };

    var blockEvent = function() {
        var e = this.event;
        //console.log("Blocking: ", e);
        e.preventDefault();
        e.cancelBubble = true;
        if (e.preventDefault) {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    // call binders for event for event target and it's parents
    var callBinders = function(eventName, currentPointer) {

        var forObject = function(object) {
            if (object.hasOwnProperty(specVar) && object[specVar].valid) {
                var ee = object[specVar].binds[eventName];
                for (var prop in ee) {
                    if (!ee.hasOwnProperty(prop)) continue;
                    handled[ee[prop]].call(object, currentPointer);
                }
            }
            return object.parentNode;
        };

        var object = currentPointer.target;
        while (object) { // down recursively calling handler for every parent of target
            object = forObject(object);
        }
        return 1;

    };

    var handlers = {

        pointerStart: function(event, id, x, y, cX, cY, target) {

            var currentPointer = {
                id: id,
                x: x,
                y: y,
                originX: x,
                originY: y,
                pageX: x,
                pageY: y,
                clientX: cX,
                clientY: cY,
                event: event,
                state: pointer.STATES.PRESS,
                target: target,
                blockEvent: blockEvent
            };
            pointer.principal = currentPointer;
            pointer.stack[id] = currentPointer;
            //console.log(currentPointer.event);
            callBinders("pointerStart", currentPointer);

        },

        keyDown: function(event) {



        },

        pointerMove: function(event, id, x, y, cX, cY) {

            if (!pointer.stack[id]) return;
            var currentPointer = {
                id: id,
                x: x,
                y: y,
                pageX: x,
                pageY: y,
                clientX: cX,
                clientY: cY,
                event: event,
                state: pointer.STATES.MOVE
            };

            updatePointer(id, currentPointer);
            callBinders("pointerMove", pointer.stack[id]);

        },

        pointerEnd: function(event, id, x, y, cX, cY) {

            if (!pointer.stack[id]) return;
            pointer.stack[id].x = x;
            pointer.stack[id].y = y;
            pointer.stack[id].pageX = x;
            pointer.stack[id].pageY = y;
            pointer.stack[id].clientX = cX;
            pointer.stack[id].clientY = cY;
            pointer.stack[id].state = pointer.STATES.RELEASE;
            if (!pointer.stack.hasOwnProperty(id)) return;
            if (pointer.stack[id].originX === x && pointer.stack[id].originY === y) {
                callBinders("pointerPress", pointer.stack[id]);
            }
            callBinders("pointerEnd", pointer.stack[id]);
            removePointer(id);
        },

        pointerPress: function() { // todo: re-organize calls

        }

    };

    var resetObjectSpecProp = function(object) {

        object[specVar] = {
            binds: {
                pointerStart: [],
                pointerMove: [],
                pointerEnd: [],
                pointerPress: [],
                keyDown: [],
                keyUp: [],
                keyPress: [],
                hoverStart: [],
                hoverEnd: []
            },
            valid: true
        }

    };

    /**
     * Binds cross-application pointer(s) event.
     * Returns handler ID, which can be used to unbind event.
     *
     * @param eventName
     * @param target
     * @param handler
     * @returns string
     */
    this.bind = function(eventName, target, handler) {
        if (handlers.hasOwnProperty(eventName)) {
            if (!target) {
                console.log("Target not specified for event " + eventName);
                return "";
            }
            if (typeof handler !== "function") {
                console.log("Handler must be a function.");
                return "";
            }
            if (!target.hasOwnProperty(specVar) || !target[specVar].valid) {
                resetObjectSpecProp(target);
            }
            var key = generateHandleKey();
            handled[key] = handler;
            target[specVar].binds[eventName].push(key);
            return key;
        } else console.log("No such event \"" + eventName + "\" for hid.bind");
        return "";
    };

    /**
     * Unbinds events.
     *
     * @param target
     * [ @param eventName ]
     * [ @param handlerID ]
     */
    this.clear = function(target, eventName, handlerID) {
        var i, u, deleting;
        if (!target || !target[specVar] || !target[specVar].binds) {
            console.log("Nothing to clear in object.", target);
            return;
        }
        if (!eventName && !handlerID) {
            for (i in target[specVar].binds) {
                if (!target[specVar].binds.hasOwnProperty(i)) continue;
                for (u = 0; u < target[specVar].binds[i].length; u++) {
                    deleting = target[specVar].binds[i].pop();
                    if (handled[deleting]) {
                        delete handled[deleting];
                    }
                }
            }
        } else if (!target[specVar].binds[eventName]) {
            console.log("No event " + eventName);
            return;
        } else if (!handlerID) {

            for (u = 0; u < target[specVar].binds[eventName].length; u++) {
                deleting = target[specVar].binds[eventName].pop();
                if (handled[deleting]) {
                    delete handled[deleting];
                }
            }
        } else {
            // todo
        }
        if (target.hasOwnProperty(specVar) && target[specVar].valid && target[specVar].binds) {
            target[specVar].binds[eventName] = [];
        }
    };

    /**
     * Cross-browser binding of browser events. For cross-browser application events use hid.bind method.
     *
     * @param event
     * @param element
     * @param handler
     */
    this.bindBrowserEvent = function (event, element, handler) {
        if (element.addEventListener) {
            element.addEventListener(event,handler,false);
        } else if (element.attachEvent) {
            element.attachEvent("on"+event, handler);
        } else {
            element[event] = handler;
        }
    };

    this.init = function() {

        var fixEvent = function(e) {
            return e || window.event;
        };

        // todo unselectable="on" as attribute for opera

        this.bindBrowserEvent('touchstart', document, function(e){
            e = fixEvent(e);
            var target = e.target || e.srcElement;
            var touch = e.touches[e.touches.length - 1];
            handlers.pointerStart(e, touch.identifier, touch.pageX,
                touch.pageY, touch.clientX, touch.clientY, target);
        });

        this.bindBrowserEvent('touchmove', document, function(e){
            e = fixEvent(e);
            var _this = e.changedTouches;
            for (var el in _this) {
                if (!_this.hasOwnProperty(el)) continue;
                handlers.pointerMove(e, _this[el].identifier, _this[el].pageX, _this[el].pageY, _this[el].clientX, _this[el].clientY);
            }
        });

        this.bindBrowserEvent('touchend', document, function(e){
            e = fixEvent(e);
            var _this = e.changedTouches;
            for (var el in _this) {
                if (!_this.hasOwnProperty(el)) continue;
                handlers.pointerEnd(e, _this[el].identifier, _this[el].pageX, _this[el].pageY, _this[el].clientX, _this[el].clientY);
            }
        });

        this.bindBrowserEvent('mousedown', document, function(e){
            e = fixEvent(e);
            var target = e.target || e.toElement;
            handlers.pointerStart(e, 1, e.pageX, e.pageY, e.clientX, e.clientY, target);
        });

        this.bindBrowserEvent('mouseup', document, function(e){
            e = fixEvent(e);
            handlers.pointerEnd(e, 1, e.pageX, e.pageY, e.clientX, e.clientY)
        });

        this.bindBrowserEvent('mousemove', document, function(e){
            e = fixEvent(e);
            handlers.pointerMove(e, 1, e.pageX, e.pageY, e.clientX, e.clientY)
        });

        /*
        this.bindBrowserEvent('keydown', document, function(e){
            //e = fixEvent(e);
            //handlers.pointerMove(e, 1, e.pageX, e.pageY, e.clientX, e.clientY)
        });

        this.bindBrowserEvent('keyup', document, function(e){
            //e = fixEvent(e);
            //handlers.pointerMove(e, 1, e.pageX, e.pageY, e.clientX, e.clientY)
        });
        */

    };

};