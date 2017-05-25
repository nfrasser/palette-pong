const pong = document.getElementById('pong')
const p1Score = document.getElementById('p1-score')
const p2Score = document.getElementById('p2-score')

// Paddle dimensions
const dim = {
    table: {
        w: 1024,
        h: 512,
    },
    paddle: {
        w: 16,
        h: 96
    }
}

// Starting speed for the x/y coordinates
const componentspeed = 10
const speed = Math.sqrt(2 * componentspeed * componentspeed) // hypotenuse

// Calculate the centre
const centre = {
    x: dim.table.w/2,
    y: dim.table.h/2
}

class Paddle {
    constructor(opts) {
        this.pos = 64
        this.player = opts.player
        this.color = opts.color
        this.scoreElement = opts.scoreElement
        this.points = 0
    }

    // Set position to a value b/w 0 and 127
    setPos(val) {
        this.pos = val
    }

    // Nudge the current position by the given number
    nudgePos(val) {
        this.pos = Math.max(0, Math.min(this.pos + val, 127))
    }

    // Get the vertical paddle position, in pixels
    getPixelPos() {
        return Math.round((1 - this.pos/128)*(dim.table.h-dim.paddle.h))
    }

    score() {
        this.scoreElement.textContent = ++this.points
    }

    draw(ctx) {
        var x = this.player === 2 ? dim.table.w - dim.paddle.w : 0
        var y = this.getPixelPos()
        var w = dim.paddle.w
        var h = dim.paddle.h

        ctx.fillStyle = this.color
        ctx.fillRect(x, y, w, h)
    }
}

class Ball {
    constructor() {
        this.color = 'black'
        this.radius = 16
        this.started = false

        // Ball position
        this.pos = {
            x: centre.x,
            y: centre.y
        }

        // Amount to move per frame in the x/y
        this.velocity = {
            x: 0,
            y: 0
        }
    }

    draw(ctx, p1, p2) {
        let {x, y} = this.pos // Current position
        let r = this.radius

        if (x === Infinity || y === Infinity) return // Just scored

        // Bounce off the horizontal walls
        if (y - r <= 0 || y + r >= dim.table.h) this.velocity.y *= -1

        if (x - r <= 0) {
            // Bounce off the paddle 1?
            let diff = y - p1.getPixelPos()
            if (diff > dim.paddle.h || diff < 0) {
                // Miss!
                p2.score()
                this.stop()
                x = Infinity
                y = Infinity
            } else {
                // Hit!
                let range = dim.paddle.h/2

                // Angle severity between -1 and 1
                let severity = (diff-range)/range

                // Determine a new angle between -60 and 60 degrees
                let theta = severity * Math.PI/3
                this.velocity.x = Math.round(Math.cos(theta)*speed)
                this.velocity.y = Math.round(Math.sin(theta)*speed)
            }
        } else if (x + r >= dim.table.w) {
            // Bounce off the paddle 2?
            let diff = y - p2.getPixelPos()
            if (diff > dim.paddle.h || diff < 0) {
                // Miss!
                p1.score()
                this.stop()
                x = Infinity
                y = Infinity
            } else {
                // Hit!
                let range = dim.paddle.h/2

                // Angle severity between -1 and 1
                let severity = (diff-range)/range

                // Determine a new angle between -60 and 60 degrees
                let theta = severity * Math.PI/3
                this.velocity.x = -Math.round(Math.cos(theta)*speed)
                this.velocity.y = Math.round(Math.sin(theta)*speed)
            }
        }

        x += this.velocity.x
        y += this.velocity.y

        ctx.beginPath()
        ctx.fillStyle = this.color
        ctx.arc(x, y, r, 0, 2*Math.PI)
        ctx.fill()
        ctx.closePath()

        this.pos.x = x
        this.pos.y = y

    }

    start() {
        if (this.started) return
        this.pos.x = centre.x
        this.pos.y = centre.y
        this.velocity.x = Math.random() < 0.5 ? componentspeed : -componentspeed
        this.velocity.y = Math.random() < 0.5 ? componentspeed : -componentspeed
        this.started = true
    }

    stop() {
        // Hide offscreen
        this.pos.x = -this.radius
        this.pos.y = -this.radius

        this.velocity.x = 0
        this.velocity.y = 0
        this.started = false
    }
}

var paddle1 = new Paddle({
    player: 1,
    color: 'red',
    scoreElement: p1Score
})
var paddle2 = new Paddle({
    player: 2,
    color: 'blue',
    scoreElement: p2Score
})
var ball = new Ball()

function draw() {

    // Set up the pong table
    var ctx = pong.getContext('2d')
    ctx.clearRect(0, 0, dim.table.w, dim.table.h)

    // Draw the paddles
    paddle1.draw(ctx)
    paddle2.draw(ctx)
    ball.draw(ctx, paddle1, paddle2)

    requestAnimationFrame(draw)
}

document.addEventListener('palette-controller', (event) => {
    var data = event.detail

    // Move paddle
    if (data.noteNumber === 1) paddle1.setPos(data.velocity)
    else if (data.noteNumber === 2) paddle2.setPos(data.velocity)

    // Redraw!
    // requestAnimationFrame(draw)
})

document.addEventListener('palette-note-on', () => {
    if (!ball.started) ball.start()
})

requestAnimationFrame(draw)
