// This uses the p5js library to create a rasterizer
// This is a modified bresenhams algorithm
let pixelSize = 2;

let pixelDim = {
    size: pixelSize
}


frameBufferDim = {
    width: 500,
    height: 800
}

let initialPosition = {
    x: 0,
    y: frameBufferDim.height
}
function getPrimitives() {
    let primitives = [
        [
            {
                x: 500,
                y: 20,
                color: [
                    0, 255, 0
                ]
            },
            {
                x: 290,
                y: 50,
                color: [
                    255, 0, 0
                ]
            },
            {
                x: 220,
                y: 510,
                color: [
                    0, 0, 255
                ]
            }
        ]
    ];
    return primitives;
}



class FrameBufferInstance {

    colorBuffer = [[]]
    constructor() {
        this.setupFrameBuffer();
    }
    setupFrameBuffer() {
        // initialise the color buffer with black screen 
        this.colorBuffer = Array(frameBufferDim.width).fill().map(each => Array(frameBufferDim.height).fill().map(each => [0, 0, 0]));
    }
    rasterize(primitives) {
        for (let i = 0; i < primitives.length; i++) {
            if (primitives[i].length != 3) {
                console.log("Only primitives with three vertices supported!");
                continue;
            }
            
            this.bresenham(primitives[i][0], primitives[i][1]);
            this.bresenham(primitives[i][1], primitives[i][2]);
            this.bresenham(primitives[i][2], primitives[i][0]);

        }
    }
    normalize(point) {
        point.x = Math.round(point.x / pixelDim.size);
        point.y = Math.round(point.y / pixelDim.size);

    }
    bresenham(a, b) {
        let A = JSON.parse(JSON.stringify(a));
        let B = JSON.parse(JSON.stringify(b));
        this.normalize(A);
        this.normalize(B);
        if (B.x == A.x) {
            let fragmentColCount = 0;
            const totalFragmentColCount = B.y - A.y;
            if (A.y >= B.y) {
                let temp = A.y;
                A.y = B.y;
                B.y = temp;
            }
            let ix = A.x;
            for (let iy = Math.round(A.y); iy <= Math.round(B.y); iy++, fragmentColCount++) {
                const alpha = fragmentColCount / totalFragmentColCount;
                let colColor = this.interpolateColor(A.color, B.color, alpha);
                this.colorBuffer[ix][iy] = colColor;
            }
            return;
        } else if (B.y == A.y) {
            let fragmentColCount = 0;
            const totalFragmentColCount = B.x - A.x;
            if (A.x >= B.x) {
                let temp = A.x;
                A.x = B.x;
                B.x = temp;
            }
            let iy = A.y;
            for (let ix = Math.round(A.x); ix <= Math.round(B.x); ix++, fragmentColCount++) {
                const alpha = fragmentColCount / totalFragmentColCount;
                let colColor = this.interpolateColor(A.color, B.color, alpha);

                this.colorBuffer[ix][iy] = colColor;
            }
            return;
        }
        if (A.x >= B.x) {
            let temp = A.x;
            A.x = B.x;
            B.x = temp;
            temp = A.y;
            A.y = B.y;
            B.y = temp;
        }
        const m = (B.y - A.y) / (B.x - A.x);
        const sign = (m >= 0);
        const md = Math.ceil(Math.abs(m));
        let Yval = sign ? (A.y) : (A.y - 1);
        let fragmentColCount = 0;

        const totalFragmentColCount = B.x - A.x;
        for (let ix = Math.round(A.x); ix <= Math.round(B.x); ix++, fragmentColCount++) {
            const alpha = fragmentColCount / totalFragmentColCount;
            let colColor = this.interpolateColor(A.color, B.color, alpha);
            let iy = Math.round(Yval);
            for (let j = 0; j < md; j++) {
                this.colorBuffer[ix][iy] = colColor;
                iy += (sign ? 1 : -1);
            }
            Yval += m;
        }
    }
    interpolateColor(startColor, endColor, alpha) {
        let interpolatedColor = [0, 0, 0];
        for (let i = 0; i < 3; i++) {
            interpolatedColor[i] = Math.round(startColor[i] * (1 - alpha) + endColor[i] * alpha);
        }
        return interpolatedColor;
    }

    render() {
        for (let ix = 0; ix < frameBufferDim.width; ix++) {
            for (let iy = 0; iy < frameBufferDim.height; iy++) {
                const position = {
                    x: initialPosition.x + ix * pixelDim.size,
                    y: initialPosition.y - iy * pixelDim.size
                }
                fill(this.colorBuffer[ix][iy][0], this.colorBuffer[ix][iy][1], this.colorBuffer[ix][iy][2])
                square(position.x, position.y, pixelDim.size);
            }

        }
    }
}


let frameBufferInstance = null;

function setup() {
    createCanvas(frameBufferDim.width, frameBufferDim.height);
    frameBufferInstance = new FrameBufferInstance();
    frameBufferInstance.rasterize(getPrimitives());
    frameBufferInstance.render();
}
