var uiController = new function() {

    var _this = this,
        UI_ELEMENT = null,
        UI_SHOWN = false,
        ELEMENTS = {
            infoBar: null,
            connect: null,
            login: null,
            message: null,
            addNode: null,
            messageHead: null,
            messageBody: null,
            editNode: null,
            jumpNode: null,
            about: null
        },
        FIELDS = { // @autofill
            connectHostname: null,
            connectPort: null,
            connectPassword: null,
            connectButton: null,
            loginUsername: null,
            loginPassword: null,
            loginNamespace: null,
            loginDatabase: null,
            loginButton: null,
            addNodeName: null,
            addNodeValue: null,
            editNodeName: null,
            editNodeValue: null,
            jumpNodeName: null,
            aboutField: null
        };

    var hideAll = function() {

        var children = UI_ELEMENT.childNodes;

        for (var i in children) {
            if (!children.hasOwnProperty(i) || children[i].tagName !== "DIV") continue;
            children[i].style.opacity = 0;
            children[i].style.visibility = "hidden";
        }

    };

    /**
     * Focuses on element with a little timeot.
     *
     * @param element
     */
    var timeFocus = function(element) {

        setTimeout(function() {
            element.focus();
            element.select();
        }, 50);

    };

    var targetElement = function(element) {

        hideAll();
        element.style.opacity = 1;
        element.style.visibility = "visible";

    };

    var showLoadingAnimation = function(enable) {

        ELEMENTS.infoBar.innerHTML = (enable)?"<img src=\"img/loading-black.gif\"/>":"";

    };

    this.showUI = function() {

        UI_SHOWN = true;
        app.switchControl(false);
        UI_ELEMENT.style.left = 0;

    };

    this.hideUI = function() {

        UI_SHOWN = false;
        app.switchControl(true);
        if (document.activeElement) document.activeElement.blur();
        UI_ELEMENT.style.left = "100%";

    };

    this.switchConnectForm = function() {

        _this.showUI();
        targetElement(ELEMENTS.connect);
        timeFocus(FIELDS.connectHostname);

    };

    this.switchLoginForm = function() {

        _this.showUI();
        targetElement(ELEMENTS.login);
        timeFocus(FIELDS.loginUsername);

    };

    this.switchAddNodeForm = function() {

        _this.showUI();
        targetElement(ELEMENTS.addNode);
        timeFocus(FIELDS.addNodeName);

    };

    this.switchEditNodeForm = function(nodeName, nodeValue) {

        FIELDS.editNodeName.value = nodeName;
        FIELDS.editNodeValue.value = nodeValue;
        _this.showUI();
        targetElement(ELEMENTS.editNode);
        timeFocus(FIELDS.editNodeValue);

    };

    this.switchJumpNodeForm = function() {

        _this.showUI();
        targetElement(ELEMENTS.jumpNode);

    };

    this.switchInfoPanel = function() {

        _this.showUI();
        targetElement(ELEMENTS.about);
        FIELDS.aboutField.innerHTML = "";
        app.getDescription(function(text){
            FIELDS.aboutField.innerHTML += "<p>" + text + "</p>";
        });

    };

    var actions = {

        connect: {

            setWaitingState: function(wait) {
                showLoadingAnimation(wait);
                FIELDS.connectButton.disabled = !!wait;
            }

        },

        login: {

            setWaitingState: function(wait) {
                showLoadingAnimation(wait);
                FIELDS.loginButton.disabled = !!wait;
            }

        }

    };

    this.showMessage = function(headHTML, bodyHTML) {

        ELEMENTS.messageHead.innerHTML = headHTML;
        ELEMENTS.messageBody.innerHTML = bodyHTML;
        ELEMENTS.message.style.left = 0;

    };

    /**
     * DOM events handlers.
     */
    this.handle = {

        connect: function() {

            if (!UI_SHOWN) return;

            var data = {
                host: FIELDS.connectHostname.value,
                port: FIELDS.connectPort.value,
                masterPassword: FIELDS.connectPassword.value
            };

            actions.connect.setWaitingState(true);
            _this.hideUI();

            server.connect(data.host, data.port, function(result) {

                if (result) {

                    server.send(data, function(success) {

                        var dbs = success.databases || {},
                            l = "";

                        for (var d in dbs) {
                            if (!dbs.hasOwnProperty(d)) continue;
                            l += "<option>" + dbs[d] + "</option>";
                        }

                        FIELDS.loginDatabase.innerHTML = l;

                        actions.connect.setWaitingState(false);
                        _this.switchLoginForm();

                    });

                } else {

                    actions.connect.setWaitingState(false);
                    _this.showMessage("Connection error", "Unable to connect to " + data.host + ":" + data.port);
                    _this.switchConnectForm();

                }

            });

        },

        login: function() {

            if (!UI_SHOWN) return;

            var data = {
                username: FIELDS.loginUsername.value,
                password: FIELDS.loginPassword.value,
                namespace: FIELDS.loginNamespace.value,
                database: FIELDS.loginDatabase.options[FIELDS.loginDatabase.selectedIndex].innerHTML
            };

            actions.connect.setWaitingState(true);
            _this.hideUI();

            server.send(data, function(responce) {

                actions.connect.setWaitingState(false);
                if (responce && responce.error === 0) {

                    _this.hideUI();
                    app.resetTreeRoot(null, data.username);

                } else {
                    _this.showMessage("Login error", "Unable to login. Server reason: " + (responce.reason || "[none]"));
                    _this.switchLoginForm();
                }

            });

        },

        messageClose: function() {

            ELEMENTS.message.style.left = "-100%";

        },

        addNode: function() {

            var name = FIELDS.addNodeName.value,
                value = FIELDS.addNodeValue.value;

            _this.hideUI();

            if (!name) {
                _this.showMessage("Unable to create node", "\"name\" field is empty.");
                return;
            }

            app.handle.addNode(name, value);

        },

        editNode: function() {

            var name = FIELDS.editNodeName.value,
                value = FIELDS.editNodeValue.value;

            _this.hideUI();

            if (!name) {
                _this.showMessage("Unable to edit node", "\"name\" field is empty.");
                return;
            }

            app.handle.editNode(name, value);

        },

        jumpNode: function() {

            var name = FIELDS.jumpNodeName.value;

            _this.hideUI();

            app.handle.jumpNode(name);

        }

    };

    var initElements = function() {

        FIELDS.connectHostname.value = document.location.hostname;
        FIELDS.connectPort.value = 57775;
        FIELDS.connectPassword.value = "protect";

    };

    var onElementFocused = function(e) {

        if (e && e.target) {
            document.activeElement = (e.target == document) ? null : e.target;
        }

    };

    this.init = function() {

        UI_ELEMENT = document.getElementById("ui");
        ELEMENTS.connect = document.getElementById("ui-connect");
        ELEMENTS.login = document.getElementById("ui-login");
        ELEMENTS.infoBar = document.getElementById("ui-infoBar");
        ELEMENTS.message = document.getElementById("ui-message");
        ELEMENTS.messageHead = document.getElementById("ui-message-head");
        ELEMENTS.messageBody = document.getElementById("ui-message-body");
        ELEMENTS.addNode = document.getElementById("ui-addNode");
        ELEMENTS.editNode = document.getElementById("ui-editNode");
        ELEMENTS.jumpNode = document.getElementById("ui-jumpNode");
        ELEMENTS.about = document.getElementById("ui-about");

        for (var i in FIELDS) {
            if (!FIELDS.hasOwnProperty(i)) continue;
            if ((FIELDS[i] = document.getElementById(i)) === undefined) {
                console.error("Listed element with ID=" + i + " is not present in DOM.")
            }
        }

        if (document.addEventListener) {
            document.addEventListener("focus", onElementFocused, true);
        }

        initElements();

    };

};
