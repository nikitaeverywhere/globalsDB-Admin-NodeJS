/**
 * Geometry functions simplifier.
 *
 * @type {{normalizeAngle: Function, angleDifference: Function}}
 */
var Geometry = {

    normalizeAngle: function(angle) {
        return (angle + Math.PI*2) % (2*Math.PI);
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
        DATA_ADAPTER = dataAdapter,
        TREE_ROOT = null,
        manipulator,
        NODE_BASE_CLASS = "node",
        LINK_BASE_CLASS = "link"; // CSS class names

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
     * Handles all user events and adapts them to the controller. Also manipulates viewport.
     */
    var Manipulator = function() {

        var _this = this,
            VIEWPORT_WIDTH = window.innerWidth,
            VIEWPORT_HEIGHT = window.innerHeight,
            VIEW_X = 0,
            VIEW_Y = 0,
            VISUAL_VIEW_X = 0,
            VISUAL_VIEW_Y = 0,
            VIEWPORT_SCALE = 1,
            WORLD_WIDTH = 100000,
            WORLD_HEIGHT = 100000,
            MIN_SCALE = 0.3,
            MAX_SCALE = 3,
            viewportUpdateInterval = 0,
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

        this.getViewX = function() { return VIEW_X - WORLD_WIDTH/2; };
        this.getViewY = function() { return VIEW_Y - WORLD_HEIGHT/2; };

        /**
         * Performs relative scale for viewport.
         */
        this.scaleView = function(delta) {

            var element = DOM_ELEMENTS.FIELD;

            VIEWPORT_SCALE += delta;

            VIEWPORT_SCALE = Math.max(MIN_SCALE, Math.min(MAX_SCALE, VIEWPORT_SCALE));

            element.style["transform"] = element.style["-ms-transform"] = element.style["-o-transform"] =
                element.style["-moz-transform"] = element.style["-webkit-transform"] =
                    "scale(" + VIEWPORT_SCALE + ")";

        };

        /**
         * Centers the viewport on a (x, y) coordinates.
         *
         * @param x
         * @param y
         */
        this.setViewCenter = function(x, y) {

            VIEW_X = WORLD_WIDTH/2 + x - VIEWPORT_WIDTH/2;
            VIEW_Y = WORLD_HEIGHT/2 + y - VIEWPORT_HEIGHT/2;
            if (!viewportUpdateInterval) viewportUpdateInterval = setInterval(viewportUpdater, 25);

        };

        var viewportUpdater = function() {

            var deltaX, deltaY;

            VISUAL_VIEW_X += deltaX = (VIEW_X - VISUAL_VIEW_X)/2;
            VISUAL_VIEW_Y += deltaY = (VIEW_Y - VISUAL_VIEW_Y)/2;

            if (Math.abs(deltaX) + Math.abs(deltaY) < 0.001) {
                clearInterval(viewportUpdateInterval);
                viewportUpdateInterval = 0;
                VISUAL_VIEW_X = VIEW_X;
                VISUAL_VIEW_Y = VIEW_Y;
            }

            DOM_ELEMENTS.VIEWPORT.scrollLeft = Math.round(VISUAL_VIEW_X);
            DOM_ELEMENTS.VIEWPORT.scrollTop = Math.round(VISUAL_VIEW_Y);

        };

        var pointerEvents = new function() {

            this.started = function(e) {

                e.ox = e.x;
                e.oy = e.y;
                e.ovx = _this.getViewX() + VIEWPORT_WIDTH/2;
                e.ovy = _this.getViewY() + VIEWPORT_HEIGHT/2;

            };

            this.moved = function(e) { // limited while pressed

                if (!e.event.changedTouches || e.event.changedTouches.length < 2) {
                    blockEvent(e.event);
                } else {
                    _this.scaleView(0);
                }
                _this.setViewCenter(e.ovx + (e.ox - e.x), e.ovy + (e.oy - e.y));

            };

            this.ended = function(e) {

                //console.log("scroll end");

            };

        };

        var keyboardEvents = new function() {

            var keyStat = {},
                KEY_PRESSED = 1,
                KEY_RELEASED = 0;

            this.keyPress = function(keyCode) {

                keyStat[keyCode] = KEY_PRESSED;

                var scrolling = function(delta) {

                    if (TREE_ROOT) TREE_ROOT.scrollEvent(delta);

                };

                switch (keyCode) {
                    case 8: { // BACKSPACE
                        if (TREE_ROOT) TREE_ROOT.backEvent();
                    } break;
                    case 13: { // ENTER
                        if (TREE_ROOT) TREE_ROOT.enterEvent();
                    } break;
                    case 38: { // UP
                        scrolling(-1);
                    } break;
                    case 40: { // DOWN
                        scrolling(1);
                    } break;
                }


            };

            this.keyRelease = function(keyCode) {
                keyStat[keyCode] = KEY_RELEASED;
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
            _this.setViewCenter(0, 0);
            VISUAL_VIEW_X = VIEW_X;
            VISUAL_VIEW_Y = VIEW_Y;

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
            DOM_ELEMENTS.VIEWPORT.onmousewheel = function(e) {
                _this.scaleView((e.deltaY || e.wheelDelta)/2000);
            };
            document.body.onkeydown = function(e) {
                keyboardEvents.keyPress(e.keyCode);
            };
            document.body.onkeyup = function(e) {
                keyboardEvents.keyRelease(e.keyCode);
            };

        };

    };

    /**
     * Node element.
     *
     * @param parentNode {Node} Parent node
     * @param index {Array} Node index
     * [ @param startX ]
     * [ @param startY ]
     * [ @param startR ]
     * @constructor
     */
    var Node = function(parentNode, index, startX, startY, startR) {

        var _this = this,
            PARENT_NODE = (parentNode instanceof Node)?parentNode:null,
            CHILD_NODES = [],
            INDEX = index,
            visualNodeProps = {
                x: 0,
                y: 0,
                r: 0,
                relativeX: manipulator.getRelativeCenter().x,
                relativeY: manipulator.getRelativeCenter().y,
                baseAngle: Math.PI // angle to parent element
            },
            value = "",
            element = null;

        this.setPosition = function(x, y) {

            visualNodeProps.x = x;
            visualNodeProps.y = y;
            updateView();

        };

        this.setRadius = function(r) {

            visualNodeProps.r = r;
            updateView();

        };

        this.setChild = function(node) {

            if (!(node instanceof Node)) return;

            for (var i in CHILD_NODES) {
                if (!CHILD_NODES.hasOwnProperty(i)) continue;
                if (CHILD_NODES[i] === node) return;
            }

            CHILD_NODES.push(node);

        };

        this.setValue = function(text) {

            value = text;
            try {
                element.childNodes[0].childNodes[0].innerHTML = value;
            } catch (e) {
                console.error("Unable to set value to node DOM element", e);
            }

        };

        this.setIndex = function(index) { // @improve (value method)

            INDEX = index;
            _this.setValue(DATA_ADAPTER.getValue(_this.getPath()));

        };

        this.setZIndex = function(z) {

            if (element) element.style.zIndex = 11 + z;

        };

        this.getX = function() { return visualNodeProps.x; };
        this.getY = function() { return visualNodeProps.y; };
        this.getR = function() { return visualNodeProps.r; };
        this.getParent = function() { return PARENT_NODE; };
        this.getIndex = function() { return INDEX; };

        this.getPath = function() {

            var path = [INDEX],
                parentNode = PARENT_NODE;

            while (parentNode) {
                path.unshift(parentNode.getIndex());
                parentNode = parentNode.getParent();
            }

            return path;

        };

        this.childController = new function() {

            var __this = this,
                node = _this,
                child = [], // full child node data [string]
                beams = {
                    // index: { index: Number, beam: Beam }
                },
                MAX_DATA_ELEMENTS = Infinity, // todo: UPDATE AGAIN WHEN DATA_ADAPTER UPDATE
                MAX_VISUAL_ELEMENTS = 15,
                INITIAL_ELEMENT_NUMBER = 30,
                SELECTED_INDEX = 0,
                VISUAL_SELECTED_INDEX = 0, // for animation
                updateViewInterval = 0;

            /**
             * Enters to selected node.
             */
            this.enter = function() { // @update SELECTED_INDEX => argument

                if (!beams[SELECTED_INDEX]) return;

                var n = beams[SELECTED_INDEX].beam.getNode();

                n.initChild();
                TREE_ROOT.setTriggeringNode(n);

            };

            this.updateSelectedIndex = function(indexDelta) {

                var last = SELECTED_INDEX;

                SELECTED_INDEX = Math.max(0, Math.min(child.length - 1, SELECTED_INDEX + indexDelta));

                if (last !== SELECTED_INDEX) alignSubNodes();

                alignSubNodes();

            };

            this.removeBeams = function() {

                for (var i in beams) {
                    if (!beams.hasOwnProperty(i)) continue;
                    beams[i].beam.remove();
                }

            };

            /**
             * Request data.
             *
             * @param number
             * @param fromIndex
             */
            var requestBaseData = function(number, fromIndex) {

                var level = DATA_ADAPTER.getLevel(node.getPath(), INITIAL_ELEMENT_NUMBER, child[fromIndex]);

                for (var i = 0; i < level.length; i++) {
                    child[fromIndex + i] = level[i];
                }

                if (level.length < number) MAX_DATA_ELEMENTS = child.length;

            };

            var alignSubNodes = function() {

                //beams = {
                      // index: { index: Number, beam: Beam }
                //}

                var fromIndex = Math.max(Math.ceil(SELECTED_INDEX - MAX_VISUAL_ELEMENTS/2), 0),
                    toIndex = Math.min(Math.floor(SELECTED_INDEX + MAX_VISUAL_ELEMENTS/2), child.length),
                    deprecatedBeams = [ /* { index, beam } */ ],
                    i, tempBeam, tempNode;

                for (i in beams) {
                    if (!beams.hasOwnProperty(i)) continue;
                    if (i < fromIndex || i >= toIndex) {
                        deprecatedBeams.push(beams[i]);
                        delete beams[i];
                    }
                }

                for (i = fromIndex; i < toIndex; i++) {

                    if (beams.hasOwnProperty(i.toString())) { // update
                        //beams[i].index = visualNodeProps.baseAngle + Math.PI + (SELECTED_INDEX - i);
                    } else if (deprecatedBeams.length) { // reset
                        tempBeam = deprecatedBeams.pop();
                        tempBeam.beam.setSubPathName(child[i]);
                        tempBeam.index = i;
                        //tempNode = tempBeam.getNode();
                        //tempNode.setValue(dataAdapter.getValue(tempNode.getPath())); // @wrong! SetPath!!!
                    } else { // create
                        beams[i] = { index: i, beam: new Beam(node, child[i], 0, 300)};
                    }

                }

                for (i = 0; i < deprecatedBeams.length; i++) { // delete
                    deprecatedBeams[i].beam.remove();
                }

                updateView();

            };

            var updateView = function() {

                if (!updateViewInterval) {
                    updateViewInterval = setInterval(viewUpdater, 25);
                }

            };

            var viewUpdater = function() { // work with indexes: display child array

                var delta, d;

                VISUAL_SELECTED_INDEX += delta = (SELECTED_INDEX - VISUAL_SELECTED_INDEX)/2.5;

                if (Math.abs(delta) < 0.001) {
                    VISUAL_SELECTED_INDEX = SELECTED_INDEX;
                    clearInterval(updateViewInterval);
                    updateViewInterval = 0;
                }

                for (var b in beams) {
                    if (!beams.hasOwnProperty(b)) continue;
                    d = beams[b].index - VISUAL_SELECTED_INDEX;
                    beams[b].beam.highlight(SELECTED_INDEX === beams[b].index); // @improve
                    beams[b].beam.getNode().setZIndex(-Math.round(d*d) + 200);
                    beams[b].beam.setAngle(Math.atan(Math.PI/1.4*d*2/MAX_VISUAL_ELEMENTS * 2)*2 - visualNodeProps.baseAngle + Math.PI);
                }

            };

            __this.init = function() {

                requestBaseData(INITIAL_ELEMENT_NUMBER, 0);
                alignSubNodes();

            };

        };

        /**
         * Joins node to the parent node.
         */
        var joinParent = function(parentNode) {

            if (!(parentNode instanceof Node)) return;

            parentNode.setChild(_this);

        };

        var createNodeElement = function() {

            var el = document.createElement("DIV");
            el.className = NODE_BASE_CLASS;
            el.innerHTML = "<div><span>" + value + "</span></div>";
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

        this.initChild = function() {

            _this.childController.init();

        };

        /**
         * Gives control to parent node.
         */
        this.back = function() {

            var parent = _this.getParent();

            if (!parent) return;

            TREE_ROOT.setTriggeringNode(parent);

        };

        this.remove = function() {

            if (element) element.parentNode.removeChild(element);
            _this.childController.removeBeams();

        };

        /**
         * Make node glow (highlight node).
         *
         * @param glow {Boolean}
         */
        this.highlight = function(glow) {

            if (element && glow) {
                element.className += " selected";
            } else {
                element.className = NODE_BASE_CLASS;
            }

        };

        var init = function() {

            joinParent(PARENT_NODE);

            value = DATA_ADAPTER.getValue(_this.getPath());

            element = createNodeElement();
            _this.setPosition(startX, startY);
            _this.setRadius(startR);
            updateView();

        };

        init();

    };

    /**
     * Connects parentNode and node with position controlling under node.
     *
     * @param parentNode
     * @param subPathName
     * [ @param initialAngle ]
     * [ @param initialRadius ]
     *
     * @constructor
     */
    var Beam = function(parentNode, subPathName, initialAngle, initialRadius) {

        var visualBeamProps = {
                angle: Geometry.normalizeAngle(initialAngle || 0),
                r: initialRadius || 100,
                relativeX: manipulator.getRelativeCenter().x,
                relativeY: manipulator.getRelativeCenter().y,
                WIDTH_EXPAND: 2,
                HALF_HEIGHT: 3 // @override
            },
            node = new Node(parentNode, subPathName, 0, 0, parentNode.getR()),
            element = null;

        var createBeamElement = function() {

            var el = document.createElement("DIV");
            el.className = LINK_BASE_CLASS;
            el.innerHTML = "<div><div><div><span>" + subPathName + "</span></div></div></div>"; // @structured
            DOM_ELEMENTS.FIELD.appendChild(el);

            visualBeamProps.HALF_HEIGHT = parseFloat(el.clientHeight)/2 || 3;

            return el;

        };

        this.setAngle = function(direction) {

            visualBeamProps.angle = Geometry.normalizeAngle(direction);
            updateView();

        };

        this.setRadius = function(radius) {

            visualBeamProps.r = radius;
            updateView();

        };

        this.remove = function() {

            if (element) element.parentNode.removeChild(element);
            if (node) node.remove();

        };

        this.setSubPathName = function(index) {

            subPathName = index;
            try {
                element.childNodes[0].childNodes[0].childNodes[0].childNodes[0].innerHTML = index;
            } catch (e) {
                console.error("Unable to set value to beam DOM element", e);
            }
            node.setIndex(index);

        };

        /**
         * Make link glow (highlight link).
         *
         * @param glow {Boolean}
         */
        this.highlight = function(glow) {

            if (element && glow) {
                element.className += " selected";
            } else {
                element.className = LINK_BASE_CLASS;
            }
            if (node) node.highlight(glow);

        };

        this.getNode = function() { return node; };
        this.getSubPath = function() { return subPathName; };
        this.getParentNode = function() { return parentNode; };
        this.getAngle = function() { return visualBeamProps.angle; };
        this.getRadius = function() { return visualBeamProps.r; };

        var updateElementPosition = function() {

            if (!parentNode || !node) return;

            /*
            * The transformations here based on relative y-shift within angle (for line height/2) pixels and rotation
            * around the left top corner of "link" box for given angle. Note that constants WIDTH_EXPAND and HALF_HEIGHT
            * are dependent from CSS.
            **/

            var x1 = parentNode.getX() - visualBeamProps.HALF_HEIGHT*Math.cos(visualBeamProps.angle + Math.PI/2),
                y1 = parentNode.getY() - visualBeamProps.HALF_HEIGHT*Math.sin(visualBeamProps.angle + Math.PI/2),
                r = parentNode.getR() - visualBeamProps.WIDTH_EXPAND,
                w = Math.sqrt(Math.pow(node.getX() - parentNode.getX(), 2) +
                    Math.pow(node.getY() - parentNode.getY(), 2)) - r - node.getR() + visualBeamProps.WIDTH_EXPAND*2,
                boxElement = element.childNodes[0].childNodes[0];

            if (w > visualBeamProps.WIDTH_EXPAND) {
                if (w < 60) {
                    boxElement.style.display = "none";
                } else {
                    boxElement.style.display = "block";
                }
                element.style.display = "block";
                element.style.width = Math.round(w) + "px";
            } else {
                element.style.display = "none";
                return;
            }

            if (USE_HARDWARE_ACCELERATION) {

                element.style["transform"] = element.style["-ms-transform"] = element.style["-o-transform"] =
                    element.style["-moz-transform"] = element.style["-webkit-transform"] = "translate3d(" +
                        (visualBeamProps.relativeX + x1 + r*Math.cos(visualBeamProps.angle)) + "px, " +
                        (visualBeamProps.relativeY + y1 + r*Math.sin(visualBeamProps.angle)) + "px, 0) rotate(" +
                        visualBeamProps.angle + "rad)";
                boxElement.style["transform"] = boxElement.style["-ms-transform"] = boxElement.style["-o-transform"] =
                    boxElement.style["-moz-transform"] = boxElement.style["-webkit-transform"] = "rotate(" +
                        ((visualBeamProps.angle < Math.PI/2 || visualBeamProps.angle > Math.PI + Math.PI/2)?0:180) + "deg)";

            } else {

                element.style.visibility = "hidden"; // @improve: svg

            }

        };

        var updateView = function() {

            node.setPosition(
                parentNode.getX() + visualBeamProps.r*Math.cos(visualBeamProps.angle),
                parentNode.getY() + visualBeamProps.r*Math.sin(visualBeamProps.angle)
            );
            updateElementPosition();

        };

        var init = function() {

            element = createBeamElement();
            updateView();

        };

        init();

    };

    /**
     * Tree root has basic tree control capabilities.
     */
    var treeRoot = function() {

        var _this = this,
            rootNode = null,
            triggeringNode = null;

        var init = function() {

            rootNode = new Node(null, "root", 0, 0, 80);
            triggeringNode = rootNode;
            rootNode.initChild();

        };

        /**
         * Scroll nodes for delta. Delta = 1 will scroll to 1 next node.
         *
         * @param delta
         */
        this.scrollEvent = function(delta) {

            if (triggeringNode) triggeringNode.childController.updateSelectedIndex(delta);

        };

        this.enterEvent = function() {

            if (triggeringNode) triggeringNode.childController.enter();

        };

        this.backEvent = function() {

            if (triggeringNode) triggeringNode.back();

        };

        this.setTriggeringNode = function(node) {

            if (!(node instanceof Node)) return;
            triggeringNode = node;

            manipulator.setViewCenter(node.getX(), node.getY());

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

        TREE_ROOT = new treeRoot();

    }

};