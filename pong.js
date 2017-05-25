const pong = document.getElementById('pong')

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

const delta = 10

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
        this.points++
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

        // Bounce off the horizontal walls
        if (y - r <= 0 || y + r >= dim.table.h) this.velocity.y *= -1

        // Bounce off the p1 paddle
        if (x - r <= 0) {
            let diff = y - p1.getPixelPos()
            if (diff > dim.paddle.h || diff < 0) {
                // Miss!
                p2.score()
                this.stop()
                x = Infinity
                y = Infinity
            } else {
                // Hit!
                this.velocity.x *= -1
            }
        } else if (x + r >= dim.table.w) {
            let diff = y - p2.getPixelPos()
            if (diff > dim.paddle.h || diff < 0) {
                // Miss!
                p1.score()
                this.stop()
                x = Infinity
                y = Infinity
            } else {
                this.velocity.x *= -1
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
        this.velocity.x = Math.random() < 0.5 ? delta : -delta
        this.velocity.y = Math.random() < 0.5 ? delta : -delta
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

var paddle1 = new Paddle({player: 1, color: 'red'})
var paddle2 = new Paddle({player: 2, color: 'blue'})
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
    if (ball.started) ball.stop()
    else ball.start()
})

requestAnimationFrame(draw)
