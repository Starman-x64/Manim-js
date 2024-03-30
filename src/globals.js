/******
 * Global variables / functions
 */

let frame_rate = 30;  // frame rate

// canvas width. Set to 1200 normally, 1250 if want to monitor frame rate during recording
let canvasWidth = 1200;

// canvas height. Ensure 16:9 ratio
let canvasHeight = 675;

let sceneNumber = 2;  // scene number

// used for chapter 2, 3
let matrix = [1, 1, 1, -1, 1, 2];
let target = [-2, 0, 3];


/*** Refactored 3D scenes on 2019-01-17
 *
 * Transforms from standard coordinates into p5'o coordinates,

 * Used for 3D scenes.
 * Transforms from standard coordinates into p5's coordinates (in the form of array),

 * so that the display of vectors, etc. is correct upon the x-y-z axes model.
 * Take care in using it, since sometimes (especially in classes),
 * the coordinates to convert is already converted to p5's system.
 * fixme: I wish JavaScript could have pass by reference so I could directly modify those values,
 * fixme: otherwise I have to return an array...
 *
 */
function stdToP5(a, b, c) {
    //if (a.length === undefined)

    if (a.length === 3) {
        return [a[1], -a[2], a[0]];   // x = y, y = -z, z = x
    } else if (a.length === 6) {      // 012 are column 1, 345 are column 2
        return [a[1], -a[2], a[0], a[4], -a[5], a[3]];
    } else if (a.length === 9) {      // 012 are ROW 1, 345 are row 2, 678 are row 3
        return [a[4], -a[5], a[3], -a[7], a[8], -a[6], a[1], -a[2], a[0]]; // fixme: weird...
    }
}

function p5ToStd(a) {
    if (a.length === 3) {
        return [a[2], a[0], -a[1]];   // x = z, y = x, z = -y
    } else if (a.length === 6) {
        return [a[2], a[0], -a[1], a[5], a[3], -a[4]];
    } else if (a.length === 9) {
        //return [a[6], a[7], a[8], a[0], a[1], a[2], -a[3], -a[4], -a[5]];
    }
}


/**
 * All animations are controlled by the number of frames passed.
 * since we might want to change the frame rate (the variable fr), it'o good to encapsulate this
 * into a new method, to be used each time we need to control the time.
 *
 * In case we want to slow down the animation play speed, we can modify this method to, say,
 * return Math.round(fr * sec * 2).
 *
 * @param sec
 * @returns {number}
 */
function frames(sec) {
  return Math.round(frame_rate * sec);
}


/**
 * All 3D/2D scenes should call in s.setup()
 */
function setup3D(p) {
  p.frameRate(frame_rate);
  p.pixelDensity(1);
  p.createCanvas(canvasWidth, canvasHeight, p.WEBGL);
}

function setup2D(p) {
  p.frameRate(frame_rate);
  p.createCanvas(canvasWidth, canvasHeight, p.WEBGL);
}


/**
 * https://github.com/processing/p5.js/wiki/Optimizing-p5.js-Code-for-Performance
 *
 * If width is normal 1200, display FPS at upper-left position.
 * If width is monitor mode (1250), display FPS at upper-right where it'o not captured by camera.
 *
 */
function showFrameRate(p) {
    const fps = p.frameRate();
    let pos = (canvasWidth === 1200) ? 0 : 1200;
    p.fill(255);
    p.textSize(10);
    p.textAlign(p.LEFT, p.TOP);
    p.noStroke();
    p.text("FPS: " + fps.toFixed(1), pos, 10);
}

function deep_copy(x) {
    let y = [];
    for (let i = 0; i < x.length; i++) {
        y[i] = x[i];
    }
    return y;
}

function vector_multiply(x, mult) {
    let v = deep_copy(x);
    for (let i = 0; i < v.length; i++) {
        v[i] *= mult;
    }
    return v;
}

function vector_add(x, y) {
    let v = [];
    for (let i = 0; i < x.length; i++) {
        v[i] = x[i] + y[i];
    }
    return v;
}

function vector_subtract(x, y) {
    let v = [];
    for (let i = 0; i < x.length; i++) {
        v[i] = x[i] - y[i];
    }
    return v;
}

/**
 * 2D Starter Template
 */
const Scene00 = p => {
  let t = {

  };
  let tnr;
  p.preload = function() {
      tnr = p.loadFont('../lib/font/times.ttf');
  };
  p.setup = function () {
      setup2D(p);
      p.dragger = new Dragger(p, []);
  };
  p.draw = function () {
      p.background(0);
      p.dragger.show();
  };
};