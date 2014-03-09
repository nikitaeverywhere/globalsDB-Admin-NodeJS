/**
 * Geometry functions simplifier.
 *
 * @type {{normalizeAngle: Function, angleDifference: Function}}
 */
var Geometry = {

    normalizeAngle: function(angle) {
        return angle % (2*Math.PI);
    },

    angleDifference: function(sourceAngle, destinationAngle) {
        return this.normalizeAngle(destinationAngle - sourceAngle);
    }

};

var app = new function() {

    var DOM_ELEMENTS = {
            VIEWPORT: null,
            FIELD: null
        },
        USE_HARDWARE_ACCELERATION = false,
        manipulator;

    var setElements = function() {

        DOM_ELEMENTS.VIEWPORT = document.getElementById("fieldViewport");
        DOM_ELEMENTS.FIELD = document.getElementById("field");

    };

    var transformsSupport = function() {

        var el = document.createElement('p'),
            has3d,
            transforms = {
                'webkitTransform':'-webkit-transform',
                'OTransform':'-o-transform',
                'msTransform':'-ms-transform',
                'MozTransform':'-moz-transform',
                'transform':'transform'
            };

        document.body.insertBefore(el, null);

        for(var t in transforms){
            if (!transforms.hasOwnProperty(t)) continue;
            if( el.style[t] !== undefined ){
                el.style[t] = 'translate3d(1px,1px,1px)';
                has3d = window.getComputedStyle(el, null).getPropertyValue(transforms[t]);
            }
        }

        document.body.removeChild(el);

        return (has3d !== undefined && has3d.length > 0 && has3d !== "none");

    };

    /**
     * Handles all user events and adapts them to the controller.
     */
    var Manipulator = function() {

        var _this = this,
            VIEWPORT_WIDTH = window.innerWidth,
            VIEWPORT_HEIGHT = window.innerHeight,
            VIEW_X = 0,
            VIEW_Y = 0,
            WORLD_WIDTH = 100000,
            WORLD_HEIGHT = 100000,
            touchObject = {
                ox: 0,
                oy: 0,
                x: 0,
                y: 0,
                target: null,
                event: null,
                pressed: false
            };

        var blockEvent = function(e) {
            e.preventDefault();
            e.cancelBubble = true;
            if (e.preventDefault) {
                e.preventDefault();
                e.stopPropagation();
            }
        };

        this.getRelativeCenter = function() {

            return {
                x: WORLD_WIDTH/2,
                y: WORLD_HEIGHT/2
            }

        };

        /**
         * Centers the viewport on a (x, y) coordinates.
         *
         * @param x
         * @param y
         */
        var setViewCenter = function(x, y) {

            DOM_ELEMENTS.VIEWPORT.scrollLeft = VIEW_X = x - VIEWPORT_WIDTH/2;
            DOM_ELEMENTS.VIEWPORT.scrollTop = VIEW_Y = y - VIEWPORT_HEIGHT/2;
            //console.log("Scrolled to ", VIEW_X, VIEW_Y);

        };

        var pointerEvents = new function() {

            this.started = function(e) {

                e.ox = e.x;
                e.oy = e.y;
                e.ovx = VIEW_X + VIEWPORT_WIDTH/2;
                e.ovy = VIEW_Y + VIEWPORT_HEIGHT/2;

            };

            this.moved = function(e) { // limited while pressed

                blockEvent(e.event);
                setViewCenter(e.ovx + (e.ox - e.x), e.ovy + (e.oy - e.y));

            };

            this.ended = function(e) {

                //console.log("scroll end");

            };

        };

        /**
         * Handles viewport update.
         */
        this.viewportUpdated = function() {

            VIEWPORT_WIDTH = window.innerWidth;
            VIEWPORT_HEIGHT = window.innerHeight;

        };

        /**
         * Returns viewport to original position.
         */
        this.resetViewport = function() {

            DOM_ELEMENTS.FIELD.style.width = WORLD_WIDTH + "px";
            DOM_ELEMENTS.FIELD.style.height = WORLD_HEIGHT + "px";
            setViewCenter(WORLD_WIDTH/2, WORLD_HEIGHT/2);

        };

        this.initialize = function() {

            if (!hid) {
                console.error("Unable to initialize manipulator: hid is undefined.");
                return;
            }

            manipulator.viewportUpdated();
            _this.resetViewport();

            var setupTouchEvent = function(event) {
                var t = (event.touches || event.changedTouches || [event])[0];
                if (!t) return;
                touchObject.x = t.pageX;
                touchObject.y = t.pageY;
                touchObject.event = event;
                touchObject.target = event.target || event.srcElement;
            };

            DOM_ELEMENTS.VIEWPORT.ontouchstart = function(e) {
                touchObject.pressed = true;
                setupTouchEvent(e);
                pointerEvents.started(touchObject);
            };
            DOM_ELEMENTS.VIEWPORT.ontouchmove = function(e) {
                setupTouchEvent(e);
                pointerEvents.moved(touchObject);
            };
            DOM_ELEMENTS.VIEWPORT.ontouchend = function(e) {
                touchObject.pressed = false;
                setupTouchEvent(e);
                pointerEvents.ended(touchObject);
            };
            DOM_ELEMENTS.VIEWPORT.onmousedown = function(e) {
                touchObject.pressed = true;
                setupTouchEvent(e);
                pointerEvents.started(touchObject);
            };
            DOM_ELEMENTS.VIEWPORT.onmousemove = function(e) {
                if (!touchObject.pressed) return;
                setupTouchEvent(e);
                pointerEvents.moved(touchObject);
            };
            DOM_ELEMENTS.VIEWPORT.onmouseup = function(e) {
                touchObject.pressed = false;
                setupTouchEvent(e);
                pointerEvents.ended(touchObject);
            };

        };

    };

    var Node = function(startX, startY, startR) {

        var _this = this,
            visualNodeProps = {
                x: 0,
                y: 0,
                r: 0,
                relativeX: manipulator.getRelativeCenter().x,
                relativeY: manipulator.getRelativeCenter().y
            },
            element = null;

        var createNodeElement = function() {

            var el = document.createElement("DIV");
            el.className = "node";
            DOM_ELEMENTS.FIELD.appendChild(el);
            return el;

        };

        var updateView = function() {

            // @optimize: -r to set* methods
            var x = Math.round(visualNodeProps.relativeX + visualNodeProps.x - visualNodeProps.r),
                y = Math.round(visualNodeProps.relativeY + visualNodeProps.y - visualNodeProps.r);

            if (USE_HARDWARE_ACCELERATION) {

                element.style["transform"] = element.style["-ms-transform"] = element.style["-o-transform"] =
                    element.style["-moz-transform"] = element.style["-webkit-transform"] = "translate3d(" +
                        x + "px, " +
                        y + "px, 0)";

            } else {

                element.style.left = x + "px";
                element.style.top = y + "px";

            }

            element.style.width = element.style.height = visualNodeProps.r*2 + "px";

        };

        this.setPosition = function(x, y) {

            visualNodeProps.x = x;
            visualNodeProps.y = y;
            updateView();

        };

        this.setRadius = function(r) {

            visualNodeProps.r = r;
            updateView();

        };

        this.getX = function() { return visualNodeProps.x };
        this.getY = function() { return visualNodeProps.y };
        this.getR = function() { return visualNodeProps.r };

        var init = function() {

            element = createNodeElement();
            _this.setPosition(startX, startY);
            _this.setRadius(startR);
            updateView();

        };

        init();

    };

    var treeRoot = function(data) {

        var _this = this,
            beams = [],
            centerNode = null,
            BIM_NUMBER = 17 + Math.random()*20;

        /**
         * Uses centerNode
         *
         * @param initialDirection
         * @param initialRadius
         * @param node
         * @constructor
         */
        var Beam = function(initialDirection, initialRadius, node) {

            var visualBeamProps = {
                    dir: initialDirection,
                    r: initialRadius
                };

            this.getNode = function() { return node };
            this.getAngle = function() { return visualBeamProps.dir };
            this.getR = function() { return visualBeamProps.r };

            var updateView = function() {

                node.setPosition(
                    centerNode.getX() + visualBeamProps.r*Math.cos(visualBeamProps.dir),
                    centerNode.getY() + visualBeamProps.r*Math.sin(visualBeamProps.dir)
                );

            };

            this.setAngle = function(direction) {

                visualBeamProps.dir = direction;
                updateView();

            };

            this.setRadius = function(radius) {

                visualBeamProps.r = radius;
                updateView();

            };

            var init = function() {

                updateView();

            };

            init();

        };

        var init = function() {

            centerNode = new Node(0, 0, 80);

        };

        init();

    };

    /**
     * Update the viewport.
     */
    this.updateViewport = function() {

        manipulator.viewportUpdated();

    };

    /**
     * Initialize application.
     */
    this.init = function() {

        USE_HARDWARE_ACCELERATION = transformsSupport();

        setElements();

        manipulator = new Manipulator();
        manipulator.initialize();

        new treeRoot(dataAdapter);

    }

};