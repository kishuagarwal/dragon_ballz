// collision detection
// taken from https://github.com/bmoren/p5.collide2D/blob/master/p5.collide2d.js

function collideRectCircle(rx, ry, rw, rh, cx, cy, diameter) {
  //2d
  // temporary variables to set edges for testing
  var testX = cx;
  var testY = cy;

  // which edge is closest?
  if (cx < rx){         testX = rx       // left edge
  }else if (cx > rx+rw){ testX = rx+rw  }   // right edge

  if (cy < ry){         testY = ry       // top edge
  }else if (cy > ry+rh){ testY = ry+rh }   // bottom edge

  // // get distance from closest edges
  var distance = this.dist(cx,cy,testX,testY)

  // if the distance is less than the radius, collision!
  if (distance <= diameter/2) {
    return true;
  }
  return false;
};


function Ball(initialX, initialY) {
    this.radius = 10;
    this.speedX = 3;
    this.speedY = 3;
    this.x = initialX;
    this.y = initialY;

    this.move = function() {
        this.x += this.speedX;
        this.y += this.speedY;
    };

    this.draw = function() {
        fill(0);
        noStroke();
        ellipse(this.x, this.y, this.radius, this.radius);
    }

    this.onCollideY = function() {
        this.speedY = -this.speedY;
    }

    this.onCollideX = function() {
        this.speedX = -this.speedX;
    }
}

function Placeholder(initialX, initialY) {
    this.x = initialX;
    this.y = initialY;
    this.width = 70;
    this.height = 17;
    this.speed = 3;

    this.move = function() {
        if (keyIsPressed) {
            if (keyCode == 97 || keyCode == LEFT_ARROW)
                this.x = max(0, this.x - this.speed);
            else if (keyCode == 100 || keyCode == RIGHT_ARROW)
                this.x = min(width - this.width, this.x + this.speed);
        }
    };
    this.draw = function() {
        fill(127);
        noStroke();
        rect(this.x, this.y, this.width, this.height);
    };
}

function Target(x, y) {
    this.x = x;
    this.y = y;
    this.width = 50;
    this.height = 20;

    this.draw = function() {
        fill(0,0,127);
        stroke(0);
        strokeWeight(3);
        rect(this.x, this.y, this.width, this.height);
    }
}

function Game() {
    this.ball = null;
    this.placeholder = null;
    this.targets = [];

    this.setup = function() {
        this.ball = new Ball(0,0);
        this.placeholder = new Placeholder(width/2, height-20);
        this.addTargets();
    };

    this.addTargets = function() {
       for (let i = 0; i < 5; i++) {
            let y = 20 * i + 20;
            for (let j = 0; j < 5; j++) {
                let x = j * 50 + 20;
                this.targets.push(new Target(x, y));
            }
       }
    };

    this.forward = function() {
        this.ball.move();
        let p = this.placeholder;
        let c = this.ball;

        // Check ball collision with placeholder
        if (collideRectCircle(p.x, p.y, p.width, p.height, c.x, c.y, 2 * c.radius)) {
            this.ball.onCollideY();
            this.ball.move();
        }

        // Check ball collision with targets
        this.targets.map(target => {
            let t = target;
            if (collideRectCircle(t.x, t.y, t.width, t.height, c.x, c.y, 2 * c.radius)) {
                this.ball.onCollideY();
                this.ball.move();
            }

        });


        // Check collision with walls
        // Left and Right wall
        if (this.ball.x < 0 || this.ball.x > width) {
            this.ball.onCollideX();
            this.ball.move();
        }

        // Up wall
        if (this.ball.y < 0 ) {
            this.ball.onCollideY();
            this.ball.move();
        }

        this.placeholder.move();
        //this.targets.map(target => target.move());
    };

    this.draw = function() {
        noStroke();
        this.ball.draw();
        this.placeholder.draw();
        this.targets.map(target => target.draw());
    };

}

let game;

function setup() {
    createCanvas(640, 480);
    game = new Game();
    game.setup();
 }

function draw() {
    background(255);
    stroke(0);
    noFill();
    rect(0,0, width, height);
    game.forward();
    game.draw();
}