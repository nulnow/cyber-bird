const startButton = document.getElementById('startButton');
const startScreen = document.getElementById('startScreen');
const gameOwerScreen = document.getElementById('gameOwerScreen');
const canvas = <HTMLCanvasElement> document.getElementById('canvas');
const scoreElement = document.getElementById('score');

const ctx = canvas.getContext('2d');
let HEIGHT: number = canvas.height;
let WIDTH: number = canvas.width;
const birdImg: HTMLImageElement = new Image();

class LocalStorageProvider {
    static set(key: string, value: any) {
        localStorage[key] = JSON.stringify(value);
    }
    static get(key: string): any {
        return localStorage[key] && JSON.parse(localStorage[key]);
    }
}

class ScoreProvider {
    static addScore(score: number) {
        if (!localStorage.scores) {
            localStorage.scores = []
        }
        localStorage.scores.push(score);
    }
    static getScores(): Array<number> {
        if (!localStorage.scores) {
            localStorage.scores = [];
        }
        localStorage.scores.sort();
        return localStorage.scores;
    }
    static getBest3(): Array<number> {
        if (!localStorage.scores) return [];
        localStorage.scores.sort();
        localStorage.scores.reverse();
        return localStorage.scores.slice(0,3);
    }
}

class Interface {
    static showStartScreen() {
        canvas.style.display = 'none';
        gameOwerScreen.style.display = 'none';
        startScreen.style.display = 'block';
        startButton.style.display = 'block';
    }
    static showGameOwerScreen(score: number) {
        const best3 = ScoreProvider.getBest3();
        scoreElement.innerHTML = Math.floor(score).toString();
        canvas.style.filter = 'blur(20px)';
        gameOwerScreen.style.display = 'block';
        startScreen.style.display = 'none';
        startButton.style.display = 'block';
    }
    static showGame() {
        canvas.style.display = 'block';
        canvas.style.filter = 'none';
        gameOwerScreen.style.display = 'none';
        startScreen.style.display = 'none';
        startButton.style.display = 'none';
    }
}

interface Column {
    x: number,
    y: number,
    width: number;
    height: number
}

class Point {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    checkCollisionWithAColumn(c: Column) {
        const { x, y } = this;
        if (
            (x >= c.x) && (x <= (c.x + c.width))
            && (y >= c.y) && (y <= (c.y + c.height))
        ) return true;
        return false;
    }
}

interface rectanglePoints {
    a: Point,
    b: Point, 
    c: Point, 
    d: Point
}

class Columns {
    x: number = WIDTH;
    y: number = HEIGHT/2;
    spdX: number = 2;
    HOLE_HEIGHT: number = 220;
    WIDTH: number = 50;
    MIN_PADDING: number = 200;

    draw(ctx: CanvasRenderingContext2D) {
        const { topColumn, bottomColumn } = this;
        ctx.fillRect(topColumn.x, topColumn.y, topColumn.width, topColumn.height);
        ctx.fillRect(bottomColumn.x, bottomColumn.y, bottomColumn.width, bottomColumn.height);
    }

    get topColumn(): Column {
        return {
            x: this.x - this.WIDTH/2,
            y: 0,
            width:  this.WIDTH,
            height: this.y - this.HOLE_HEIGHT/2
        };
    }

    get bottomColumn(): Column {
        return {
            x: this.x - this.WIDTH/2,
            y: this.y + this.HOLE_HEIGHT/2,
            width: this.WIDTH,
            height: HEIGHT - (this.y + this.HOLE_HEIGHT/2)
        };
    }
}

class Bird {
    x: number = WIDTH / 2;
    y: number = HEIGHT / 2;
    spdY: number = 0;
    SIZE: number = 50;
    img: HTMLImageElement = new Image();
    imgSrc: string = 'bird.png';
    score: number = 0;
    maxTopSpeed = 6;

    constructor() {
        this.img.src = this.imgSrc;
    }

    draw(ctx: CanvasRenderingContext2D) {
        const { x, y, SIZE, img } = this;
        const s2: number = SIZE/2;

        const heightLength: number = Math.abs( (0 + s2) - (HEIGHT - s2));
        const percent: number = Math.abs(y) / heightLength;
        const angleDeg: number = percent * (80 + 80) - 80;
        const angleRad: number = angleDeg*Math.PI/180;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angleRad);
        ctx.translate(-x, -y);
        ctx.drawImage(img, x - s2, y - s2, SIZE, SIZE);
        ctx.restore();

        ctx.fillText(`Score スコア: ${Math.floor(this.score)}`, 10, 10);
    }

    isCollidingColumns(columns: Columns): boolean {
        const { topColumn, bottomColumn } = columns;
        const rectanglePoints: rectanglePoints = this.rectanglePoints;
        const points = Object.keys(rectanglePoints).map(key => rectanglePoints[key]);
        return points.some(point => {
            return point.checkCollisionWithAColumn(topColumn) || point.checkCollisionWithAColumn(bottomColumn);
        });
    }

    isOutOfTheCanvas(width: number, height: number) {
        const { x, y, SIZE } = this;
        const s2: number = SIZE/2;
        return (y - s2 <= 0) || (y + s2 >= height);
    }

    get rectanglePoints(): rectanglePoints {
        const {x, y} = this;
        const s2: number = this.SIZE/2
        return {
            a: new Point(x - s2, y - s2),
            b: new Point(x + s2, y - s2),
            c: new Point(x + s2, y + s2),
            d: new Point(x - s2, y + s2)
        }
    }
}

class Game {
    bird: Bird = new Bird;
    columns: Columns = new Columns;
    ctx: CanvasRenderingContext2D;
    FPS: number = 60;
    isPaused: boolean = false;
    gameLoop: any;
    g: number = 16;
    bg: HTMLImageElement = new Image;
    bgx: number = 0;

    bindedOnKeyPress: any;
    bindedOnClick: any;

    constructor(ctx: CanvasRenderingContext2D) {
        this.bg.src = 'bg.png';
        this.ctx = ctx;
        this.bindedOnKeyPress = this.onKeyPress.bind(this);
        this.bindedOnClick = this.onClick.bind(this);
    }

    startNewGame() {
        this.setEventListeners();
        Interface.showGame();

        this.gameLoop = setInterval(() => {
            const { ctx, bird, columns, isPaused, FPS } = this;
            ctx.clearRect(0,0,WIDTH,HEIGHT);

            if (!isPaused) {
                this.update();
                this.bgx -= 0.8;
                if (this.bgx + this.bg.width <= WIDTH) {
                    ctx.drawImage(this.bg, this.bgx + this.bg.width, 0, this.bg.width, HEIGHT);
                    if (this.bgx + this.bg.width <= 0) {
                        this.bgx = 0;
                    }
                }
            }

            ctx.drawImage(this.bg, this.bgx, 0, this.bg.width, HEIGHT);
            bird.draw(ctx);
            columns.draw(ctx);
        }, 1000/this.FPS)

    }

    update() {
        const { bird, g, FPS } = this;

        bird.spdY += g / FPS;
        bird.y += bird.spdY;

        {
            const { columns } = this;
            const { topColumn } = columns;
            columns.x -= columns.spdX;
            if (topColumn.x + columns.WIDTH <= 0) {
                const {MIN_PADDING, HOLE_HEIGHT} = columns;
                columns.x = WIDTH + columns.WIDTH;
                var A = (HEIGHT - MIN_PADDING - HOLE_HEIGHT/2);
                var B = (MIN_PADDING + HOLE_HEIGHT/2);
                var L = A - B;
                var F = L + MIN_PADDING;
                columns.y = Math.random() * (F) + MIN_PADDING;
                bird.score += 1;
                columns.spdX += (0.8) ** (bird.score);
            }
        }

        if (
            bird.isCollidingColumns(this.columns) || bird.isOutOfTheCanvas(WIDTH, HEIGHT)
        ) {
            this.gameOwer(this.bird.score);
        }
    }

    gameOwer(score: number) {
        clearInterval(this.gameLoop);
        this.removeEventListeners();
        ScoreProvider.addScore(score);
        Interface.showGameOwerScreen(score);
    }

    setEventListeners() {
        canvas.addEventListener('mousedown', this.bindedOnClick);
        document.addEventListener('keypress', this.bindedOnKeyPress);
    }
    
    removeEventListeners() {
        canvas.removeEventListener('mousedown', this.bindedOnClick);
        document.removeEventListener('keypress', this.bindedOnKeyPress);
    }

    onKeyPress(event: any) {
        if (event.keyCode === 32) {
            this.bird.spdY = -this.bird.maxTopSpeed;
        } else if (event.keyCode === 80) {
            this.isPaused = !this.isPaused;
        }
    }

    onClick() {
        this.bird.spdY = -this.bird.maxTopSpeed;
    }
}

startButton.onclick = function() {
    Interface.showGame();
    var game = new Game(ctx);
    game.startNewGame();
}