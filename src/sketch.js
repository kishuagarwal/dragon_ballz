function Ball(initialX, initialY) {
    this.radius = 10;
    this.speed = 4;
    this.velocityX = this.speed;
    this.velocityY = this.speed;
    this.x = initialX;
    this.y = initialY;

    this.move = function() {
        this.x += this.velocityX;
        this.y += this.velocityY;
    };

    this.draw = function() {
        fill(0);
        noStroke();
        ellipse(this.x, this.y, this.radius, this.radius);
    }

    this.revertHorizontal = function() {
        this.velocityX = -this.velocityX;
    }

    this.revertVertical = function() {
        this.velocityY = -this.velocityY;
    }

    // Checks collision of the ball with the given rectangle
    // In case of collision, reflect the ball and adjust the velocity
    // Returns true if collision did happen, else return false
    this.checkCollisionWithRect = function(rect) {
        // Coarse check
        if (this.x + this.radius < rect.x || this.x - this.radius > rect.x + rect.width) {
            return false;
        }

        if (this.y + this.radius < rect.y || this.y - this.radius > rect.y + rect.height) {
            return false;
        }

        // LEFT EDGE
        if (this.x < rect.x && this.x + this.radius > rect.x) {
            this.revertHorizontal();
            this.move();
            return true;
        }

        // RIGHT EDGE
        if (this.x > rect.x + rect.width && this.x - this.radius < rect.x + rect.width) {
            this.revertHorizontal();
            this.move();
            return true;
        }

        // TOP EDGE
        if (this.y < rect.y && this.y + this.radius > rect.y) {
            this.revertVertical();
            this.move();
            return true;
        }

        // RIGHT EDGE
        if (this.y > rect.y + rect.height && this.y - this.radius < rect.y + rect.height) {
            this.revertVertical();
            this.move();
            return true;
        }

        return false;
    }
}

function Placeholder(initialX, initialY) {
    this.x = initialX;
    this.y = initialY;
    this.width = 70;
    this.defaultWidth = 70;
    this.height = 17;
    this.speed = 5;

    this.halfWidth = function() {
        this.width = this.defaultWidth / 2;
    }

    this.restoreWidth = function() {
        this.width = this.defaultWidth;
    }

    this.scaleWidth = function(hitCount) {
        this.width = this.defaultWidth + hitCount * 3;
    }

    this.move = function() {
        if (keyIsPressed) {
            if (keyCode == 97 || keyCode == LEFT_ARROW)
                this.x = max(0, this.x - this.speed);
            else if (keyCode == 100 || keyCode == RIGHT_ARROW)
                this.x = min(width - this.width, this.x + this.speed);
        }
    };
    this.draw = function() {
        fill(70);
        noStroke();
        rect(this.x, this.y, this.width, this.height);
    };
}

function Target(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    // Assign random color to the target
    this.color = [int(random(255)), int(random(255)), int(random(255))]

    this.draw = function() {
        fill(...this.color);
        stroke(0);
        strokeWeight(3);
        rect(this.x, this.y, this.width, this.height);
    }
}

function Game() {
    this.ball = null;
    this.placeholder = null;
    this.targets = [];
    this.score = 0;
    this.gameOver = false;

    this.setup = function() {
        this.addBall();
        this.addPlaceholder();
        this.addTargets();
    };

    this.addBall = function() {
        // Set the ball in the uppermost left corner of the game
        this.ball = new Ball(0,0);
    };

    this.addPlaceholder = function() {
        // Set the placeholder in the bottom-middle of the game
        this.placeholder = new Placeholder(width/2, height-20);
    }

    this.addTargets = function() {
       let targetHeight = 20;
       let targetWidth = 50;
       // Number of rows of targets
       let numTargetsRows = 5;
       // Number of targets per row
       let numTargetsPerRow = 10;
       // Y offset of the first row of targets
       let yOffset = 50;
       // X offset of the first row of targets
       let xOffset = (width - numTargetsPerRow * targetWidth) / 2;
       for (let i = 0; i < numTargetsRows; i++) {
            let y = targetHeight * i + yOffset;
            for (let j = 0; j < numTargetsPerRow; j++) {
                let x = j * targetWidth + xOffset;
                this.targets.push(new Target(x, y, targetWidth, targetHeight));
            }
       }
    };

    this.checkGameOver = function() {
        // If either all the targets have been destroyed or ball has 
        // gone below the allowed region, then the game is over
        if (this.targets.length == 0 || this.ball.y > height) {
            // Stop the game loop
            noLoop();
            this.gameOver = true;
        }
    }

    this.forward = function() {
        this.ball.move();

        // Check ball collision with placeholder
        this.ball.checkCollisionWithRect(this.placeholder);

        // Check ball collision with targets
        const prevLength = this.targets.length;
        this.targets = this.targets.filter(target => !this.ball.checkCollisionWithRect(target));
        const newLength = this.targets.length;

        this.score += (prevLength - newLength) * 2

        // Check collision with walls
        // Left and Right wall
        if (this.ball.x < 0 || this.ball.x > width) {
            this.ball.revertHorizontal();
        }

        // Up wall
        if (this.ball.y < 0 ) {
            this.ball.revertVertical();
        }

        this.placeholder.move();
        this.checkGameOver();

    };

    this.draw = function() {
        noStroke();
        //background(239, 228, 210);
        if (this.gameOver) {
            background(0, 150);
            fill(255);
            textSize(30);
            text('Game Over', width/2, height/2);
            return;
        }
        background(255, 192, 203);
        this.showScore();
        this.ball.draw();
        this.placeholder.draw();
        this.targets.map(target => target.draw());
    };

    this.showScore = function() {
        // Show score in top right
        fill(255);
        textSize(24);
        text(`Score: ${this.score}`, width - 150, 50)
    }
}

let game;
function setup() {
    createCanvas(1024, 640);
    game = new Game();
    game.setup();
 }

function draw() {
    stroke(0);
    noFill();
    rect(0,0, width, height);
    game.forward();
    game.draw();
}