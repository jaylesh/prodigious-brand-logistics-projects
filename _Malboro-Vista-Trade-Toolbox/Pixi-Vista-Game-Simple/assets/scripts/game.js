"use strict";
(function(w) {
    function Game(width, height) {
        var _s = this;

        _s.loader = PIXI.Loader.shared;
        _s.render, _s.resizeTimer, _s.addTimerId;
        _s.app, _s.stage, _s.container, (_s.gameWidth = width), (_s.gameHeight = height);
        _s.lists = [], _s.balls = [];
        _s.clips = ["blue", "dark-violet", "green", "orange", "sunset-1", "sunset-2"];
        _s.speed = 1.5, _s.shuffleCount = 0, _s.circleToAddCounter = 0, _s.maxCircleToAdd = 12;
        _s.ballsContainer, _s.bcWidth = 90, _s.bcHeight = 120;
        _s.box, _s.target, _s.currentTarget, _s.isDragging, _s.isPointerMoving, _s.data;
        _s.isOver = false;

        // methods
        _s.init = function() {
            _s.preload();
        };
        _s.preload = function() {
            _s.loader.add("blue", "./assets/img/blue.png");
            _s.loader.add("dark-violet", "../assets/img/dark-violet.png");
            _s.loader.add("green", "./assets/img/green.png");
            _s.loader.add("orange", "./assets/img/orange.png");
            _s.loader.add("sunset-1", "./assets/img/orange-sunset-1.png");
            _s.loader.add("sunset-2", "./assets/img/orange-sunset-2.png");
            _s.loader.add("target", "./assets/img/target.png");
            _s.loader.add("orange-ball", "./assets/img/orange-ball.png");
            _s.loader.add("blue-ball", "./assets/img/blue-ball.png");
            _s.loader.add("dark-violet-ball", "./assets/img/dark-violet-ball.png");
            _s.loader.add("green-ball", "./assets/img/green-ball.png");
            _s.loader.add("sunset-1-ball", "./assets/img/sunset-1-ball.png");
            _s.loader.add("sunset-2-ball", "./assets/img/sunset-2-ball.png");
            _s.loader.load();
            _s.loader.onComplete.add(function() {
                _s.buildScene();
                _s.addEvents();
            });
        };
        _s.buildScene = function() {
            PIXI.utils.skipHello();
            _s.app = new PIXI.Application({
                width: _s.gameWidth,
                height: _s.gameHeight,
                view: document.getElementById("game-stage"),
                transparent: true,
                resolution: window.devicePixelRatio || 1,
            });
            _s.container = new PIXI.Container();
            _s.container.position.set(0, Math.round(_s.header().height));
            _s.app.stage.addChild(_s.container);

            _s.ballsContainer = new PIXI.Container();
            _s.app.stage.addChild(_s.ballsContainer);

            _s.app.ticker.stop();
            gsap.ticker.add(() => {
                _s.app.ticker.update();
            });
            _s.app.ticker.add(_s.update);

            _s.target = new PIXI.Sprite(_s.loader.resources["target"].texture);
            _s.target.scale.set(0.35);
            _s.target.anchor.set(0.5);
            _s.target.x = _s.bcWidth / 2;
            _s.target.y = _s.target.height / 2;
            _s.ballsContainer.addChild(_s.target);

            //debug clips
            _s.graphic = new PIXI.Graphics();
            _s.graphic.alpha = 0.4;
            _s.graphic.beginFill(0xc34288);
            _s.graphic.drawRect(-(_s.bcWidth / 2), _s.target.height / 2, _s.bcWidth, _s.bcHeight);
            _s.graphic.endFill();
            //_s.container.addChildAt(_s.graphic, 0);
            //_s.ballsContainer.addChild(_s.graphic);

            gsap.fromTo(
                _s.target,
                1, { alpha: 0, y: 0 }, {
                    alpha: 1,
                    y: _s.target.height / 2,
                    onComplete: function() {
                        _s.addBalls({ color: "orange-ball" });
                        _s.addBalls({ color: "blue-ball" });
                        _s.addBalls({ color: "sunset-1-ball" });
                        _s.addBalls({ color: "green-ball" });
                        _s.addBalls({ color: "sunset-2-ball" });
                        _s.addBalls({ color: "dark-violet-ball" });
                    },
                }
            );
            _s.addWithDelay();
        };
        _s.addWithDelay = function() {
            var max = _s.clips.length - 1;
            var c = _s.shuffleCount;
            _s.addTimerId = setTimeout(_s.addWithDelay, 450);
            if (_s.circleToAddCounter < _s.maxCircleToAdd) {
                var circle = _s.circle(_s.clips[c]);
                var _ = circle.blur ?
                    _s.container.addChildAt(circle, 0) :
                    circle.scale >= 0.35 && circle.scale.x <= 0.46 ?
                    _s.container.addChildAt(circle, 0) :
                    _s.container.addChild(circle);
                _s.circleToAddCounter = _s.circleToAddCounter + 1;
            }

            _s.shuffleCount = _s.shuffleCount >= max ? _s.shuffleCount = 0 : _s.shuffleCount + 1;
            //shuffle if has max count
            if (_s.shuffleCount >= max) {
                gsap.utils.shuffle(_s.clips);
            };
        };
        _s.circle = function(o) {
            const parent = _s.app.view.parentNode;
            let w = parent.clientWidth;
            let h = parent.clientHeight;

            var c = new PIXI.Sprite(_s.loader.resources[o].texture);
            c.anchor.set(0.5);
            c.interactive = true;
            c.name = o;
            c.cacheAsBitmap = true
            var ran = gsap.utils.random(0.2, 0.6);
            var scale = ran;
            var yPos = gsap.utils.random(50, 170);
            c.scale.set(scale);
            if (_s.lists.length >= 1) {
                var last = _s.lists[_s.lists.length - 1].mc
                c.x = Math.round(c.width + last.x);
            } else { c.x = Math.round(w + c.width); }
            c.y = yPos;
            c.blur = false;
            //c.cacheAsBitmap = true;

            //filter
            const blurFilter1 = new PIXI.filters.BlurFilter();
            if (c.scale.x <= 0.3) {
                blurFilter1.blur = gsap.utils.random(1, 3);
                c.filters = [blurFilter1];
                c.blur = true;
                c.cacheAsBitmap = false;
            }


            //c.cacheAsBitmap = true; //scale <= 0.18 ? true : false;
            _s.lists.push({
                mc: c,
                color: c,
                scale: c.scale
            });
            return c;
        };
        _s.addBalls = function(o) {
            var container = new PIXI.Sprite();
            container.anchor.set(0.5);
            var ball = _s.ball(o);
            _s.ballsContainer.addChild(container);
            //container.addChild(_s.graphic);
            container.x = (_s.bcWidth / 2);
            container.y = (_s.target.height / 2);
            container.addChild(ball);
            _s.alignBalls();
        }
        _s.alignBalls = function() {
            var th = _s.target.height;
            _s.balls.forEach((e, i) => {
                var ball = e.mc;
                _s.removeDragEvent(ball);
                if (i === 0) {
                    _s.addDragEvent(ball);
                    ball.info.origin = { x: 0, y: 0 };
                }
                gsap.fromTo(ball, 0.4, {
                    x: 0,
                    y: i === 0 ? th : 110,
                    alpha: 1
                }, {
                    y: th * i,
                    delay: (0.5 * i)
                });
            });
        }
        _s.ball = function(o) {
            let b = new PIXI.Sprite(_s.loader.resources[o.color].texture);
            b.info = o;
            b.index = _s.balls.length;
            b.scale.set(0.4);
            b.anchor.set(0.5);
            b.info.scale = 0.4;
            b.interactive = true;
            b.buttonMode = true;
            _s.balls.push({ mc: b });
            return b;
        };
        //events
        _s.onResized = function() {
            const parent = _s.app.view.parentNode;
            const canvas = _s.app.view;
            let w = parent.clientWidth;
            let h = parent.clientHeight;
            _s.gameWidth = w;
            _s.gameHeight = h;
            canvas.style.width = w + "px";
            canvas.style.height = h + "px";
            canvas.width = w;
            canvas.height = h;
            _s.app.renderer.resize(w, h);
            _s.container.position.set(0, _s.header().height);
            _s.ballsContainer.position.set((w - _s.ballsContainer.width) / 2, (h - _s.bcHeight) - 5);
        };
        _s.setLevel = function() {};
        _s.update = function(delta) {
            if (_s.isOver) {
                _s.stop();
            }
            if (_s.lists.length > 0) {
                _s.lists.forEach((e, i) => {
                    var clip = e.mc;
                    clip.index = i;
                    if (e !== null) {
                        var parent = clip.parent;
                        if (clip.blur) {
                            clip.x -= (_s.speed / 1.5) * delta;
                        } else if (clip.scale.x < 0.45) {
                            clip.x -= (_s.speed / 0.8) * delta;
                        } else {
                            clip.x -= _s.speed * delta;
                        }
                        if (clip.x <= -clip.width) {
                            if (parent != null) {
                                var last = _s.lists[_s.lists.length - 1].mc
                                clip.x = _s.gameWidth + Math.round(clip.width) + gsap.utils.random(30, 110);
                                clip.y = gsap.utils.random(50, 170);
                                /*parent.removeChild(clip);
                                clip.destroy({ children: true, baseTexture: true });
                                clip = null;
                                _s.lists.splice(i, 1);*/
                            }
                        }
                    }
                });
            }
        };
        _s.reset = function() {};
        _s.stop = function() {
            _s.isOver = true;
            clearTimeout(_s.addTimerId);
            _s.app.ticker.stop();
        };
        _s.restart = function() {
            _s.isOver = false;
            _s.app.ticker.start();
            _s.addWithDelay();
        };

        //removed clip from stage
        _s.removed = function(arr, clip) {
                if (clip !== null) {
                    var parent = clip.parent;
                    if (parent != null) {
                        parent.removeChild(clip);
                        clip.destroy({ children: true, baseTexture: true });
                        arr.splice(clip.index, 1);
                        clip = null;
                    }
                }
            }
            //swap position
        _s.swapPosition = function(arr) {
            var c = arr.shift();
            arr.push(c);
            gsap.delayedCall(0.15, _s.alignBalls, null);
        }

        //events
        _s.onDragStart = function(e) {
            var mc = e.currentTarget;
            _s.currentTarget = mc;
            _s.data = e.data;
            gsap.to(mc, 0.35, {
                scaleX: 0.5,
                scaleY: 0.5
            });
            _s.isDragging = true;
            console.log('down');
        }
        _s.onDragMove = function(e) {
            if (_s.isDragging) {
                const newPosition = _s.data.getLocalPosition(this.parent);
                this.x = newPosition.x;
                this.y = newPosition.y;
            }
        };
        _s.onDragEnd = function(e) {
            var target = e.currentTarget;
            _s.isDragging = false;
            _s.currentTarget = null;
            _s.data = null;
            _s.lists.forEach((e) => {
                if (!target.isHit) {
                    if (_s.rectsIntersect(target, e.mc)) {
                        e.mc.isHit = true;
                        target.isHit = true;
                    }
                }
            });
            if (!target.isHit) {
                gsap.to(target, 0.35, {
                    x: target.info.origin.x,
                    y: target.info.origin.y,
                    scaleX: target.info.scale,
                    scaleY: target.info.scale,
                    ease: "sine"
                });
            } else if (target.isHit) {
                target.isHit = false;
                gsap.to(target, 0.5, {
                    scaleX: target.info.scale,
                    scaleY: target.info.scale,
                    alpha: 0,
                    ease: "sine",
                    onComplete: function() {

                    }
                });
                if (_s.delayedCall) {
                    _s.delayedCall.kill();
                }
                _s.delayedCall = gsap.delayedCall(0.15, function() {
                    _s.removeDragEvent(target);
                    _s.swapPosition(_s.balls);
                });
            }
        };

        _s.addDragEvent = function(ball) {
            ball.on("pointerdown", _s.onDragStart)
                .on("pointerup", _s.onDragEnd)
                .on("pointerupoutside", _s.onDragEnd)
                .on("pointermove", _s.onDragMove);
        };

        _s.removeDragEvent = function(ball) {
            ball.off("pointerdown")
                .off("pointerup")
                .off("pointerupoutside")
                .off("pointermove");
        }

        _s.rectsIntersect = function(a, b) {
            var aCircle = a.getBounds();
            var bCircle = b.getBounds();
            return aCircle.x + aCircle.width > bCircle.x &&
                aCircle.x < bCircle.x + bCircle.width &&
                aCircle.y + aCircle.height > bCircle.y &&
                aCircle.y < bCircle.y + bCircle.height;
        }

        //stage events
        _s.addEvents = function() {
            _s.onResized();
            window.addEventListener(
                "resize",
                () => {
                    clearTimeout(_s.resizeTimer);
                    _s.resizeTimer = setTimeout(function() {
                        _s.onResized();
                    }, 250);
                },
                false
            );

            var v = helper.visible();
            //add if user switch browser tab we pause the game
            document.addEventListener(
                v.event,
                (e) => {
                    if (document.visibilityState == "hidden") {
                        _s.stop();
                    } else {
                        _s.restart();
                    }
                },
                false
            );

            //add orientation event
            window.addEventListener(
                "orientationchange",
                (e) => {
                    switch (window.orientation) {
                        case 0:
                            //if (!_s.isOver) _s.restart();
                            break;
                        case 90:
                        case -90:
                            //if (!_s.isOver) _s.stop();
                            break;
                    }
                },
                false
            );

            //chrome fix
            window.addEventListener("wheel", e => {
                e.preventDefault();
            }, { passive: false });
        };
        _s.header = function() { return document.getElementById("header").getBoundingClientRect(); }
    }

    window.addEventListener("load", function() {
        var gameWrapper = document.getElementById('game-wrapper');
        var info = gameWrapper.getBoundingClientRect();
        var height = info.height;
        var width = info.width;

        let g = new Game(width, height);
        g.init();

    });
})(window);

Object.defineProperties(PIXI.Sprite.prototype, {
    scaleX: {
        get: function() {
            return this.scale.x;
        },
        set: function(v) {
            this.scale.x = v;
        },
    },
    scaleY: {
        get: function() {
            return this.scale.y;
        },
        set: function(v) {
            this.scale.y = v;
        },
    },
});