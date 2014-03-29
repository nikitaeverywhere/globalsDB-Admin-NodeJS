var uiController = new function() {

    var _this = this,
        UI_ELEMENT = null,
        ELEMENTS = {
            login: null
        },
        FIELDS = { // @autofill
            loginHostname: null,
            loginPort: null,
            loginPassword: null
        };

    var hideAll = function() {

        var children = UI_ELEMENT.childNodes;

        for (var i in children) {
            if (!children.hasOwnProperty(i) || children[i].tagName !== "DIV") continue;
            children[i].style.visibility = "hidden";
        }

    };

    var targetElement = function(element) {

        hideAll();
        element.style.visibility = "visible";

    };

    this.showUI = function() {

        app.switchControl(false);
        UI_ELEMENT.style.opacity = 1;
        UI_ELEMENT.style.visibility = "visible";

    };

    this.hideUI = function() {

        app.switchControl(true);
        UI_ELEMENT.style.opacity = 0;
        UI_ELEMENT.style.visibility = "hidden";

    };

    this.showLoginForm = function() {

        _this.showUI();
        targetElement(ELEMENTS.login);

    };

    this.handle = {

        login: function() {

            alert("Log in!");

        }

    };

    this.init = function() {

        UI_ELEMENT = document.getElementById("ui");
        ELEMENTS.login = document.getElementById("ui-login");

        for (var i in FIELDS) {
            if (!FIELDS.hasOwnProperty(i)) continue;
            if ((FIELDS[i] = document.getElementById(i)) === undefined) {
                console.error("Listed element with ID=" + i + " is not present in DOM.")
            }
        }

    };

};
