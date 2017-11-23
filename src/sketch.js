// collision detection
// taken from https://github.com/bmoren/p5.collide2D/blob/master/p5.collide2d.js

let RectEdge;

let COLLISION_DETECTION_RECT_EDGE = null;

let TARGET_HIT_COUNT = 0;

function collideRectCircle(rx, ry, rw, rh, cx, cy, radius) {
  //2d
  // temporary variables to set edges for testing
  var testX = cx;
  var testY = cy;

  // which edge is closest?
  if (cx < rx){
    testX = rx       // left edge
    COLLISION_DETECTION_RECT_EDGE = RectEdge.LEFT;
  }
  else if (cx > rx+rw){
    testX = rx+rw
    COLLISION_DETECTION_RECT_EDGE = RectEdge.RIGHT;
   }   // right edge

  if (cy < ry){
    testY = ry       // top edge
    COLLISION_DETECTION_RECT_EDGE = RectEdge.TOP;
  }
  else if (cy > ry+rh){
    testY = ry+rh
    COLLISION_DETECTION_RECT_EDGE = RectEdge.BOTTOM;
  }   // bottom edge

  // // get distance from closest edges
  var distance = this.dist(cx,cy,testX,testY)

  // if the distance is less than the radius, collision!
  if (distance <= radius) {
    return true;
  }
  return false;
};


function Ball(initialX, initialY) {
    this.radius = 10;
    this.speed = 4;
    this.velocity = createVector(1,1).setMag(this.speed);
    this.x = initialX;
    this.y = initialY;

    this.move = function() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    };

    this.draw = function() {
        fill(0);
        noStroke();
        ellipse(this.x, this.y, this.radius, this.radius);
    }

    this.isCollidingWithRect = function(rect) {
        return collideRectCircle(rect.x, rect.y, rect.width, rect.height, this.x, this.y, this.radius);
    }

    this.onCollideWithRect = function() {
        let collidingEdge = COLLISION_DETECTION_RECT_EDGE;

        // Normalize the edge vector
        let edge_vector = collidingEdge;
        edge_vector.normalize();

        // Find the reflection vector
        let ref_vector = p5.Vector.sub(this.velocity, p5.Vector.mult(edge_vector, this.velocity.dot(edge_vector) * 2));
        ref_vector.normalize();

        // Apply the new speeds
        this.velocity = ref_vector.setMag(this.speed);
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

function Target(x, y) {
    this.x = x;
    this.y = y;
    this.width = 50;
    this.height = 20;
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

    this.setup = function() {
        this.ball = new Ball(0,0);
        this.placeholder = new Placeholder(width/2, height-20);
        this.addTargets();
    };

    this.addTargets = function() {
       let targetHeight = 20;
       let targetWidth = 50;
       let numTargetsRows = 5;
       let numTargetsPerRow = 10;
       let yOffset = 50;
       let xOffset = (width - numTargetsPerRow * targetWidth) / 2;
       for (let i = 0; i < numTargetsRows; i++) {
            let y = targetHeight * i + yOffset;
            for (let j = 0; j < numTargetsPerRow; j++) {
                let x = j * targetWidth + xOffset;
                this.targets.push(new Target(x, y));
            }
       }
    };

    this.checkGameOver = function() {
        if (this.targets.length == 0 || this.ball.y > height) {
            noLoop();
            alert('Game Over');
            location.reload();
        }
    }

    this.forward = function() {
        this.ball.move();

        // Check ball collision with placeholder
        if (this.ball.isCollidingWithRect(this.placeholder)) {
            this.ball.onCollideWithRect();
            /*if (TARGET_HIT_COUNT == 0) {
                this.placeholder.halfWidth();
            } else if (TARGET_HIT_COUNT == 1) {
                this.placeholder.restoreWidth();
            }*/
            TARGET_HIT_COUNT = 0;
        }

        // Check ball collision with targets
        this.targets = this.targets.filter(target => {
            let t = target;
            if (this.ball.isCollidingWithRect(t)) {
                this.ball.onCollideWithRect();
                TARGET_HIT_COUNT += 1;
                /*if (TARGET_HIT_COUNT > 1)
                this.placeholder.scaleWidth(TARGET_HIT_COUNT);
                */
                return false
            }
            return true;
        });

        // Check collision with walls
        // Left and Right wall
        if (this.ball.x < 0 || this.ball.x > width) {
            COLLISION_DETECTION_RECT_EDGE = RectEdge.LEFT;
            this.ball.onCollideWithRect();
        }

        // Up wall
        if (this.ball.y < 0 ) {
            COLLISION_DETECTION_RECT_EDGE = RectEdge.TOP;
            this.ball.onCollideWithRect();
        }

        this.placeholder.move();
        //this.targets.map(target => target.move());

        this.checkGameOver();

    };

    this.draw = function() {
        noStroke();
        background(239, 228, 210);
        this.ball.draw();
        this.placeholder.draw();
        this.targets.map(target => target.draw());
    };

}

let game;
function setup() {
    createCanvas(640, 480);
    RectEdge = {
        LEFT: createVector(1,0),
        RIGHT: createVector(1,0),
        BOTTOM: createVector(0,1),
        TOP: createVector(0,1),
    };

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