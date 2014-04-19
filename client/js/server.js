var server = new function() {

    var ws,
        CONNECTED = false,
        connectionHandler,
        LOG_DATA = true,
        REQUESTS_LIMIT = 2, // @todo
        handlers = {};

    var requestStack = []; // stack with requesting objects

    var generateHandlerID = function() {

        var key;

        do {
            key = parseInt(Math.random().toString().substr(2));
        } while (handlers.hasOwnProperty(key));

        return key;

    };

    var handleConnectionError = function(event) {

        console.log("Connection error! ", event);

    };

    var callHandler = function(connectionResult) {

        if (connectionHandler) {
            connectionHandler.call(window, connectionResult);
        } else {
            app.handle.connectionClose();
        }

        connectionHandler = undefined;

    };

    var handleConnectionClose = function(event) {

        if (!(event || {}).wasClean) {
            console.log("WS event not clean.", event);
        } else {

        }

        for (var i in handlers) {
            if (!handlers.hasOwnProperty(i)) continue;
            if (LOG_DATA) console.log("<< " + i + " << CONNECTION_ABORT");
            handlers[i](false, {
                error: 1,
                result: false,
                reason: "Dead server."
            });
            delete handlers[i];
        }

        callHandler(CONNECTED = false);

        app.handle.connectionClose();

    };

    var handleConnectionOpen = function() {

        callHandler(CONNECTED = true);

    };

    var handleConnectionMessage = function(data) {

        try {
            data = JSON.parse(data.data);
        } catch (e) { console.error("Error parsing server data.", data.data); return }

        if (data.__id && handlers.hasOwnProperty(data.__id)) {
            if (LOG_DATA) console.log("<< " + data.__id + " <<", data);
            handlers[data.__id](data);
            delete handlers[data.__id];
        } else {
            if (LOG_DATA) console.log("<< [not handled] <<", data);
        }

    };

    this.send = function(object, handler) {

        if (!CONNECTED) return 0;
        if (handler && typeof handler === "function") {
            var h;
            handlers[h = generateHandlerID()] = handler;
            object.__id = h;
            if (LOG_DATA) console.log(">> " + h + " >>", object);
        } else if (LOG_DATA) console.log(">>", object);
        ws.send(JSON.stringify(object));
        return 1;

    };

    this.connect = function(host, port, handler) {

        if (CONNECTED) {
            handler(false, {
                error: 1,
                result: false,
                reason: "Already connected."
            });
            return;
        }
        if (typeof handler === "function") connectionHandler = handler;
        try {
            ws = new WebSocket("ws://" + host + ":" + port);
        } catch (e) {
            var obj = {
                reason: "Wrong url",
                wasClean: false
            };
            handleConnectionError(obj);
            handleConnectionClose(obj);
            return;
        }
        ws.onopen = handleConnectionOpen;
        ws.onerror = handleConnectionError;
        ws.onclose = handleConnectionClose;
        ws.onmessage = handleConnectionMessage;

    };

    this.disconnect = function() {

        if (!CONNECTED) return;
        ws.close();

    };

    this.connected = function() {

        return CONNECTED;

    };

};