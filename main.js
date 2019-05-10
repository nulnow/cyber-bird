var startButton = document.getElementById('startButton');
var startScreen = document.getElementById('startScreen');
var gameOwerScreen = document.getElementById('gameOwerScreen');
var canvas = document.getElementById('canvas');
var scoreElement = document.getElementById('score');
var ctx = canvas.getContext('2d');
var HEIGHT = canvas.height;
var WIDTH = canvas.width;
var birdImg = new Image();
var Interface = /** @class */ (function () {
    function Interface() {
    }
    Interface.showStartScreen = function () {
        canvas.style.display = 'none';
        gameOwerScreen.style.display = 'none';
        startScreen.style.display = 'block';
        startButton.style.display = 'block';
    };
    Interface.showGameOwerScreen = function (score) {
        scoreElement.innerHTML = Math.floor(score).toString();
        canvas.style.filter = 'blur(20px)';
        gameOwerScreen.style.display = 'block';
        startScreen.style.display = 'none';
        startButton.style.display = 'block';
    };
    Interface.showGame = function () {
        canvas.style.display = 'block';
        canvas.style.filter = 'none';
        gameOwerScreen.style.display = 'none';
        startScreen.style.display = 'none';
        startButton.style.display = 'none';
    };
    return Interface;
}());
var Point = /** @class */ (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    Point.prototype.checkCollisionWithAColumn = function (c) {
        var _a = this, x = _a.x, y = _a.y;
        if ((x >= c.x) && (x <= (c.x + c.width))
            && (y >= c.y) && (y <= (c.y + c.height)))
            return true;
        return false;
    };
    return Point;
}());
var Columns = /** @class */ (function () {
    function Columns() {
        this.x = WIDTH;
        this.y = HEIGHT / 2;
        this.spdX = 2;
        this.HOLE_HEIGHT = 220;
        this.WIDTH = 50;
        this.MIN_PADDING = 200;
    }
    Columns.prototype.draw = function (ctx) {
        var _a = this, topColumn = _a.topColumn, bottomColumn = _a.bottomColumn;
        ctx.fillRect(topColumn.x, topColumn.y, topColumn.width, topColumn.height);
        ctx.fillRect(bottomColumn.x, bottomColumn.y, bottomColumn.width, bottomColumn.height);
    };
    Object.defineProperty(Columns.prototype, "topColumn", {
        get: function () {
            return {
                x: this.x - this.WIDTH / 2,
                y: 0,
                width: this.WIDTH,
                height: this.y - this.HOLE_HEIGHT / 2
            };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Columns.prototype, "bottomColumn", {
        get: function () {
            return {
                x: this.x - this.WIDTH / 2,
                y: this.y + this.HOLE_HEIGHT / 2,
                width: this.WIDTH,
                height: HEIGHT - (this.y + this.HOLE_HEIGHT / 2)
            };
        },
        enumerable: true,
        configurable: true
    });
    return Columns;
}());
var Bird = /** @class */ (function () {
    function Bird() {
        this.x = WIDTH / 2;
        this.y = HEIGHT / 2;
        this.spdY = 0;
        this.SIZE = 50;
        this.img = new Image();
        this.imgSrc = 'bird.png';
        this.score = 0;
        this.maxTopSpeed = 6;
        this.img.src = this.imgSrc;
    }
    Bird.prototype.draw = function (ctx) {
        var _a = this, x = _a.x, y = _a.y, SIZE = _a.SIZE, img = _a.img;
        var s2 = SIZE / 2;
        var heightLength = Math.abs((0 + s2) - (HEIGHT - s2));
        var percent = Math.abs(y) / heightLength;
        var angleDeg = percent * (80 + 80) - 80;
        var angleRad = angleDeg * Math.PI / 180;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angleRad);
        ctx.translate(-x, -y);
        ctx.drawImage(img, x - s2, y - s2, SIZE, SIZE);
        ctx.restore();
        ctx.fillText("Score \u30B9\u30B3\u30A2: " + Math.floor(this.score), 10, 10);
    };
    Bird.prototype.isCollidingColumns = function (columns) {
        var topColumn = columns.topColumn, bottomColumn = columns.bottomColumn;
        var rectanglePoints = this.rectanglePoints;
        var points = Object.keys(rectanglePoints).map(function (key) { return rectanglePoints[key]; });
        return points.some(function (point) {
            return point.checkCollisionWithAColumn(topColumn) || point.checkCollisionWithAColumn(bottomColumn);
        });
    };
    Bird.prototype.isOutOfTheCanvas = function (width, height) {
        var _a = this, x = _a.x, y = _a.y, SIZE = _a.SIZE;
        var s2 = SIZE / 2;
        return (y - s2 <= 0) || (y + s2 >= height);
    };
    Object.defineProperty(Bird.prototype, "rectanglePoints", {
        get: function () {
            var _a = this, x = _a.x, y = _a.y;
            var s2 = this.SIZE / 2;
            return {
                a: new Point(x - s2, y - s2),
                b: new Point(x + s2, y - s2),
                c: new Point(x + s2, y + s2),
                d: new Point(x - s2, y + s2)
            };
        },
        enumerable: true,
        configurable: true
    });
    return Bird;
}());
var Game = /** @class */ (function () {
    function Game(ctx) {
        this.bird = new Bird;
        this.columns = new Columns;
        this.FPS = 60;
        this.isPaused = false;
        this.g = 16;
        this.bg = new Image;
        this.bgx = 0;
        this.bg.src = 'bg.png';
        this.ctx = ctx;
        this.bindedOnKeyPress = this.onKeyPress.bind(this);
        this.bindedOnClick = this.onClick.bind(this);
    }
    Game.prototype.startNewGame = function () {
        var _this = this;
        this.setEventListeners();
        Interface.showGame();
        this.gameLoop = setInterval(function () {
            var _a = _this, ctx = _a.ctx, bird = _a.bird, columns = _a.columns, isPaused = _a.isPaused, FPS = _a.FPS;
            ctx.clearRect(0, 0, WIDTH, HEIGHT);
            if (!isPaused) {
                _this.update();
                _this.bgx -= 0.8;
                if (_this.bgx + _this.bg.width <= WIDTH) {
                    ctx.drawImage(_this.bg, _this.bgx + _this.bg.width, 0, _this.bg.width, HEIGHT);
                    if (_this.bgx + _this.bg.width <= 0) {
                        _this.bgx = 0;
                    }
                }
            }
            ctx.drawImage(_this.bg, _this.bgx, 0, _this.bg.width, HEIGHT);
            bird.draw(ctx);
            columns.draw(ctx);
        }, 1000 / this.FPS);
    };
    Game.prototype.update = function () {
        var _a = this, bird = _a.bird, g = _a.g, FPS = _a.FPS;
        bird.spdY += g / FPS;
        bird.y += bird.spdY;
        {
            var columns = this.columns;
            var topColumn = columns.topColumn;
            columns.x -= columns.spdX;
            if (topColumn.x + columns.WIDTH <= 0) {
                var MIN_PADDING = columns.MIN_PADDING, HOLE_HEIGHT = columns.HOLE_HEIGHT;
                columns.x = WIDTH + columns.WIDTH;
                var A = (HEIGHT - MIN_PADDING - HOLE_HEIGHT / 2);
                var B = (MIN_PADDING + HOLE_HEIGHT / 2);
                var L = A - B;
                var F = L + MIN_PADDING;
                columns.y = Math.random() * (F) + MIN_PADDING;
                bird.score += 1;
                columns.spdX += Math.pow((0.8), (bird.score));
            }
        }
        if (bird.isCollidingColumns(this.columns) || bird.isOutOfTheCanvas(WIDTH, HEIGHT)) {
            this.gameOwer(this.bird.score);
        }
    };
    Game.prototype.gameOwer = function (score) {
        clearInterval(this.gameLoop);
        this.removeEventListeners();
        Interface.showGameOwerScreen(score);
    };
    Game.prototype.setEventListeners = function () {
        canvas.addEventListener('mousedown', this.bindedOnClick);
        document.addEventListener('keypress', this.bindedOnKeyPress);
    };
    Game.prototype.removeEventListeners = function () {
        canvas.removeEventListener('mousedown', this.bindedOnClick);
        document.removeEventListener('keypress', this.bindedOnKeyPress);
    };
    Game.prototype.onKeyPress = function (event) {
        if (event.keyCode === 32) {
            this.bird.spdY = -this.bird.maxTopSpeed;
        }
        else if (event.keyCode === 80) {
            this.isPaused = !this.isPaused;
        }
    };
    Game.prototype.onClick = function () {
        this.bird.spdY = -this.bird.maxTopSpeed;
    };
    return Game;
}());
startButton.onclick = function () {
    Interface.showGame();
    var game = new Game(ctx);
    game.startNewGame();
};
