X = [];
var server = new function() {

    var ws,
        CONNECTED = false,
        connectionHandler,
        LOG_DATA = false,
        REQUESTS_LIMIT = 2,
        REQUESTS_IN_PROGRESS = 0,
        REQUEST_TIMEOUT = 5000,
        handlers = {};

    var requestStack = [], // stack with requesting objects
        requestSentStack = [];

    var stackSend = function(data) {

        if (!data.__id) {
            ws.send(JSON.stringify(data));
            return;
        }

        requestStack.push({
            req: data
        });
        sendStack();

    };

    var clearSentStack = function() {

        var d = new Date();

        for (var i = 0; i < requestSentStack.length; i++) {
            if (d - requestSentStack[i].timestamp > REQUEST_TIMEOUT - 25) {
                console.warn("Dead request", requestSentStack[i].req);
                if (handlers.hasOwnProperty(requestSentStack[i].req.__id)) {
                    handlers[requestSentStack[i].req.__id]({
                        error: 1,
                        reason: "Dead request"
                    });
                    delete handlers[requestSentStack[i].req.__id];
                }
                clearTimeout(requestSentStack[i].timeout);
                requestSentStack.splice(i, 1);
                REQUESTS_IN_PROGRESS--;
            }
        }

    };

    var sendStack = function() { // __id guaranteed

        uiController.showLoadingAnimation(requestStack.length !== 0);

        for (var n = REQUESTS_IN_PROGRESS, i = 0; n < REQUESTS_LIMIT && i < requestStack.length; n++, i++) {
            var req = requestStack.splice(0, 1)[0];
            ws.send(JSON.stringify(req.req));
            requestSentStack.push({
                req: req.req,
                timeout: setTimeout(clearSentStack, REQUEST_TIMEOUT),
                timestamp: new Date()
            });
            REQUESTS_IN_PROGRESS++;
        }

    };

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

        //app.handle.connectionClose();

    };

    var handleConnectionOpen = function() {

        callHandler(CONNECTED = true);

    };

    var handleConnectionMessage = function(data) {

        try {
            data = JSON.parse(data.data);
        } catch (e) { console.error("Error parsing server data.", data.data); return; }

        if (data.__id && handlers.hasOwnProperty(data.__id)) {
            if (LOG_DATA) console.log("<< " + data.__id + " <<", data);
            handlers[data.__id](data);
            delete handlers[data.__id];
        } else {
            if (LOG_DATA) console.log("<< [not handled] <<", data);
        }

        if (data.__id) {
            REQUESTS_IN_PROGRESS--;
            sendStack();
            for (var i = 0; i < requestSentStack.length; i++) {
                if (requestSentStack[i].req.__id == data.__id) {
                    clearTimeout(requestSentStack[i].timeout);
                    requestSentStack.splice(i, 1);
                }
            }
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

        stackSend(object);

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