/**
 * Human input device module extends standard event binding capabilities.
 */
var hid = new function() {

    var handlers = {

        },
        specProp = "!hid";

    var callHandlers = function(element, event, e) {

        if (!element || !element.hasOwnProperty(specProp)
            || !element[specProp].hasOwnProperty("handlers")
            || !element[specProp].handlers.hasOwnProperty(event)) return;

        if (event === "mousedown" || event === "mouseup") element[specProp].pressed = (event === "mousedown");
        if (event === "mousemove" && !element[specProp].pressed) return;

        e.blockEvent = blockEvent;

        for (var handlerID in element[specProp].handlers[event]) {
            if (!element[specProp].handlers[event].hasOwnProperty(handlerID)) continue;
            element[specProp].handlers[event][handlerID].call(element, e);
        }

    };

    var events = {

        click: function(e) { callHandlers(this, "click", e); },
        mousedown: function(e) { callHandlers(this, "mousedown", e); },
        mouseup: function(e) { callHandlers(this, "mouseup", e); },
        mousemove: function(e) { callHandlers(this, "mousemove", e); }

    };

    var bindBrowserEvent = function (event, element, handler) {
        if (element.addEventListener) {
            element.addEventListener(event,handler,false);
        } else if (element.attachEvent) {
            element.attachEvent("on"+event, handler);
        } else {
            element[event] = handler;
        }
    };

    var blockEvent = function() {
        var e = this;
        e.preventDefault();
        e.cancelBubble = true;
        if (e.preventDefault) {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    var generateHID = function() {

        var id;

        do { id = Math.random().toString().slice(2) } while (handlers.hasOwnProperty(id));

        return id;

    };

    this.bind = function(event, handler, element) {

        if (!events.hasOwnProperty(event) || typeof element !== "object" || typeof handler !== "function") {
            console.error("Unable to handle event " + event + " on " + element);
            return;
        }

        if (!element[specProp]) {
            element[specProp] = {
                handlers: {}
            };
        }

        if (!element[specProp].handlers[event]) element[specProp].handlers[event] = {};

        var id = generateHID();

        handlers[id] = 1;
        element[specProp].handlers[event][id] = handler;

        bindBrowserEvent(event, element, events[event]);

    }

};