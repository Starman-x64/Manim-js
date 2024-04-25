import { VMobject, CapStyleType, LineJoinType } from "../mobject/types/vectorizedMobject.js";
import {Scene} from "../scene/scene.js";
import { WHITE, BLACK, RED, GREEN, BLUE, YELLOW, ORANGE, TRANSPARENT, ManimColor } from "../color/manimColor.js";
import { bezier } from "../utils/bezier.js";
import { Validation, defineUndef } from "../utils/validation.js";
import { Text } from "../mobject/text/textMobject.js";
import { Mobject, MobjectReference } from "../mobject/mobject.js";

const GLOBAL_SCALE = 20;


class Canvas {
  /**
   * @param  {[canvas: HTMLCanvasElement, is3d?: false] | [width: Number, height: Number, is3d?: false]} args 
   */
  constructor(...args) {
    /**
     * The `HTMLCanvasElement` this `Canvas` object represents.
     * @type {HTMLCanvasElement}
     */
    this._canvas = this._canvasFactory(...args);
    this._ctx = this._canvasContextFactory(...args);
    
    /**
     * @type {ManimColor}
     */
    this.backgroundColor = new ManimColor(WHITE);
  }

  get width() { return this._canvas.width; }
  get height() { return this._canvas.height; }
  set width(newWidth) { this._canvas.width = newWidth; }
  set height(newHeight) { this._canvas.height = newHeight; }
  
  /** @param {ManimColor} color */
  set fillStyle(color) { this._ctx.fillStyle = color.hex; }
  /** @param {ManimColor} color */
  set strokeStyle(color) { this._ctx.strokeStyle = color.hex; }
  /** @param {ManimColor} color */
  set fillAndStrokeStyle(color) { this._ctx.fillStyle = color.hex; this._ctx.strokeStyle = color.hex; }
  
  /** @returns {Number} */
  get lineWidth() { return this._ctx.lineWidh; }
  /** @param {Number} newWidth */
  set lineWidth(newWidth) { this._ctx.lineWidth = newWidth; }
  
  /**
   * Clear the canvas.
   * @returns {this}
   */
  clear() {
    return this;
  }
  
  /**
   * Draw a `Mobject` onto the screen.
   * @param {Mobject} mobject The `Mobject` to draw.
   * @returns {this}
   */
  draw(mobject) {
    return this;
  }
  
  
  /**
   * @param  {HTMLCanvasElement | [width: Number, height: Number]} args 
   * @returns {HTMLCanvasElement}
   */
  _canvasFactory(...args) {
    if (Validation.isOfClass(args[0], HTMLCanvasElement)) {
      
      return this._canvasFromCanvas(args[0]);
    }
    Validation.testNumber({width: args[0]});
    Validation.testNumber({height: args[1]});
    return this._canvasFromWidthAndHeight(args[0], args[1]);
  }
  
  /**
   * @param  {[canvas: HTMLCanvasElement, is3d: Boolean] | [width: Number, height: Number, is3d: Boolean]} args 
   * @returns {RenderingContext}
   */
  _canvasContextFactory(...args) {
    /** @type {Number} */
    let dimension = 2;
    if (Validation.isOfClass(args[0], HTMLCanvasElement)) {
      dimension = args[1];
    }
    dimension = args[2];
    return this._canvas.getContext(dimension ? "webgl2" : "2d");
  }
  
  /**
   * @param {Number} width The width of the `HTMLCanvasElement`.
   * @param {Number} height The height of the `HTMLCanvasElement`.
   * @returns {HTMLCanvasElement}
   */
  _canvasFromWidthAndHeight(width, height) {
    let canvas = document.createElement("canvas");
    [canvas.width, canvas.height] = [width, height];
    document.body.appendChild(canvas);
    canvas.style = "outline: solid 1px black";
    return canvas;
  }

  /**
   * @param {HTMLCanvasElement} canvas The pre-existing canvas element to render to.
   * @returns {HTMLCanvasElement}
   */
  _canvasFromCanvas(canvas) {
    return canvas;
  }
}

class Canvas2D extends Canvas {
  /**
   * @param  {[canvas: HTMLCanvasElement] | [width: Number, height: Number]} args 
   */
  constructor(...args) {
    super(...[...args, false]);
  }
  
  clear() {
    this._ctx.fillStyle = this.backgroundColor.hex;
    this._ctx.rect(0,0, this.width, this.height);
    this._ctx.fill();
    
    return this;
  }
}

class Canvas3D extends Canvas {
  /**
   * @param  {[canvas: HTMLCanvasElement] | [width: Number, height: Number]} args 
   */
  constructor(...args) {
    super(...[...args, true]);
  }
}

/**
 * Renders a `Scene` to the canvas.  
 * Handles animation frames, and prepares `Mobjects` for drawing by `Canvas`.
 */
class Renderer {
  /**
   * @param {Scene} scene The scene to render.
   * @param {Canvas} canvas The `Canvas` object containing the `HTMLCanvasElement` to render to.
   */
  constructor(scene, canvas) {
    /**
     * The `Scene` to render.
     * @type {Scene}
     */
    this.scene = scene;
    
    /**
     * The `Canvas` to render the `Scene` to.
     * @type {Canvas}
     */
    this.canvas = canvas;
    
    /**
     * The last ID returned by `window.requestAnimationFrame()`. Stored so that rendering may be cancelled.
     * @type {Number | null}
     */
    this.animationFrameId = null;
    
    /**
     * Time in ms when the frame before last finished rendering.
     * @type {Number | null}
     */
    this.previousTimeStamp = null;
    
    /**
     * Timestamp in ms when rendering began.
     * @type {Number | null}
     */
    this.renderStartTimeStamp = null;
  }

  /**
   * Begin the rendering process by recording the "zero" time (`this.renderStartTimeStamp`) and requesting the first frame.
   * @returns {void}
   */
  beginRendering() {
    this.renderStartTimeStamp = document.timeline.currentTime;
    this.requestNextFrame();
  }
  
  /**
   * End calls to `window.requestAnimationFrame()`.
   * @returns {void}
   */
  endRendering() {
    while(this.animationFrameId--) {
      window.cancelAnimationFrame(this.animationFrameId);
    }
  }
  
  /**
   * Request the next frame of animation.
   * @returns {void}
   */
  requestNextFrame() {
    this.animationFrameID = window.requestAnimationFrame((t) => this.renderFrame(t));
  }

  /**
   * Render a frame of animation.
   * @param {number} timeStamp Time in ms when the last frame finished processing.
   * @returns {void}
   */
  renderFrame(timeStamp) {
    const dt = this.calculateDeltaTime(timeStamp);

    this.updateScene(dt/1000); // Convert `dt` to seconds.
    this.drawScene();
    this.drawFPS(dt); // Draw the FPS on top of everything.
    
    this.requestNextFrame();
  }
  
  /**
   * Update the mobjects in the scene.
   * @param {number} dtSeconds Delta time in seconds.
   * @returns {void}
   */
  updateScene(dtSeconds) {
    this.scene.update(dtSeconds);
  }
  
  /**
   * Calculate the delta time since the last frame.
   * @param {number} timeStampMillis Time in ms when the last frame finished processing.
   * @returns {number} Delta time `dt` in milliseconds.
   */
  calculateDeltaTime(timeStampMillis) {
    if (this.previousTimeStamp === null) {
      this.previousTimeStamp = this.renderStartTimeStamp;
    }
    let dt = timeStampMillis - this.previousTimeStamp;
    this.previousTimeStamp = timeStampMillis;
    return dt;
  }
  
  /**
   * Display the FPS in the top left of the screen as `FPS=${1000/dt}`.
   * @param {number} dt Delta time of the last frame.
   * @param {number} precision Number of decimal places to display.
   */
  drawFPS(dt, precision=1) {

  }
  
  /**
   * Draw the scene's mobjects onto the screen.
   * @returns {void}
   */
  drawScene() {
    
  }

}

/**
 * Handles all the rendering for a 2D scene.
 */
class Renderer2D extends Renderer {
  /**
   * @param {Scene} scene The scene to render.
   * @param {number} width The width of the canvas.
   * @param {number} height The height of the canvas.
   */
  constructor(scene, width, height) {
    super(scene, new Canvas2D(width, height));
  }

  /**
   * Set various default properties of the canvas context.
   * @returns {void}
   */
  setCanvasDefaults() {
    // this.canvas.lineCap = CapStyleType.AUTO;
    // this.canvas.lineJoin = LineJoinType.AUTO;
  }

  /**
   * Display the FPS in the top left of the screen as `FPS=${1000/dt}`.
   * @param {number} dt Delta time of the last frame.
   * @param {number} precision Number of decimal places to display.
   */
  drawFPS(dt, precision=1) {
    const fps = 1000/dt;
    this.canvas.fillStyle = "white";
    this.canvas.strokeStyle = this.canvas.backgroundColor.hex;
    this.canvas._ctx.textBaseline = "top";
    this.canvas._ctx.lineWidth = 5;
    this.canvas._ctx.font = this.canvas._ctx.font.replace(/(?<value>\d+\.?\d*)/, 12);
    this.canvas._ctx.strokeText(`FPS=${fps.toFixed(precision)}`, 5, 5);
    this.canvas._ctx.font = this.canvas._ctx.font.replace(/(?<value>\d+\.?\d*)/, 12);
    this.canvas._ctx.fillText(`FPS=${fps.toFixed(precision)}`, 5, 5);
  }
  
  /**
   * Draw the scene's mobjects onto the screen.
   * @returns {void}
   */
  drawScene() {
    this.canvas.clear();
    
    let camera = this.scene.camera;
    
    this.scene.mobjects.forEach(mobject => {
      this.drawMobject(mobject);
    });
  }
  
  /**
   * Draw the given `Mobject` to the screen.  
   * Converts the `Mobject`'s world position to a canvas position, then passes the data on to `this.canvas`.
   * @param {MobjectReference} mobject The `Mobject` to draw.
   * @returns {void}
   */
  drawMobject(mobject) {
    let canvasPoints = mobject.value.points;
    // console.log(canvasPoints);
  }
  
  /**
   * Convert the position of an object in world-space to canvas-space.
   * @param {Number[]} world World-space coordinates.
   * @returns {Number[]}
   */
  worldToCanvasCoords(world) {
    let worldAugmentedVector = [...world, 1]; // augmented row-vector.
    let transformationMatrix = [
      [GLOBAL_SCALE, 0],
      [0, -GLOBAL_SCALE],
      [0, 0],
      [this.canvas.width/2 - this.scene.camera.x, this.canvas.height/2 + this.scene.camera.y]
    ]
    return math.multiply(worldAugmentedVector, transformationMatrix);
  }
  
  /**
   * Draws the given `VMobject`.  
   * Handled differently from `GMobject`s (graphic mobjects) because VMobjects are drawn with `Path2D`.
   * @param {VMobject} mobject The `VMobject` to draw.
   * @returns {void}
   */
  drawVMobject(mobject) {
    // console.log("Drawing", mobject.name); 
    /** @type {string[]} */
    let curveTypes = mobject.curveTypes;
    /** @type {number[][]} */
    let points = [];
    for(let i = 0; i < mobject.points.shape[0]; i++) {
      let point = this.worldToCanvasCoords(...(mobject.points.slice([i,i+1]).flatten().selection.data));
      points.push(point);
    }

    /** @type {boolean} */
    let drawFill = !!(mobject.fillColor.alpha() * mobject.fillOpacity);
    /** @type {boolean} */
    let drawStroke = !!(mobject.strokeColor.alpha() * mobject.strokeOpacity);

    /** @type {ManimColor} */
    let fillColor = mobject.fillColor.toString("rgba");
    /** @type {ManimColor} */
    let strokeColor = mobject.strokeColor.toString("rgba");


    /** @type {{onPath: Path2D, quadratic: Path2D, cubic: Path2D, lines: Path2D}} */
    let paths;
    if (mobject.drawBezierHandles) {
      paths = SVGDrawer.generateControlPointPath2D(points, curveTypes);
    }
    else {
      paths = SVGDrawer.generatePath2D(points, curveTypes);
    }

    this.ctx.strokeStyle = strokeColor;
    this.ctx.fillStyle = fillColor;
    if (drawStroke) {
      this.ctx.setLineDash(mobject.lineDash);
      this.ctx.lineWidth = mobject.strokeWidth;
      this.ctx.stroke(paths.curve);
    }
    if (drawFill) {
      this.ctx.fill(paths.curve);
    }
    
    if (mobject.drawBezierHandles) {
      this.ctx.setLineDash([5, 5]);
      this.ctx.lineWidth = 1;
      this.ctx.strokeStyle = WHITE.interpolate(BLACK, 0.25).hex;
      this.ctx.stroke(paths.lines);
      this.ctx.setLineDash([]);

      this.ctx.fillStyle = RED.hex;
      this.ctx.fill(paths.onPath);

      this.ctx.fillStyle = BLUE.hex;
      this.ctx.fill(paths.quadratic);

      this.ctx.fillStyle = GREEN.hex;
      this.ctx.fill(paths.cubic);
    }
    
    // Now draw each of the submobjects
    mobject.submobjects.forEach(mob => {
      this.drawVMobject(mob);
    });
  }
  
  /**
   * Draws the given `Text` mobject.  
   * @param {Text} mobject The `Text` to draw.
   * @returns {void}
   */
  drawText(mobject) {
    if(mobject.opacity == 0) return;
    mobject.color.setAlpha(mobject.fillOpacity * mobject.opacity);

    let screenCoords = this.worldToCanvasCoords(...(mobject.points.selection.data));

    /** @type {ManimColor} */
    let color = mobject.color.toString("rgba");
    
    this.ctx.font = mobject.getCanvasFontStyleString();
    this.ctx.fillStyle = color;
    this.ctx.textAlign = mobject.align;
    this.ctx.textBaseline = mobject.baseline;
    this.ctx.fillText(mobject.text, screenCoords[0], screenCoords[1]);
    
    // Now draw each of the submobjects
    mobject.submobjects.forEach(mob => {
      this.drawText(mob);
    });
  }

  
  /**
   * Convert the position of an object in worldspace to screenspace.
   * @param {number} worldX Worldspace x-coordinate (0 = centre of canvas).
   * @param {number} worldY Worldspace y-coordinate (0 = centre of canvas).
   * @returns {number[]}
   */
  worldToCanvasCoords(worldX, worldY) {
    return [(worldX*GLOBAL_SCALE + this.canvas.width/2 - this.scene.camera.x()), -(worldY*GLOBAL_SCALE - this.canvas.height/2- this.scene.camera.y())];
  }
}

/**
 * Interprets point positions and converts them into SVG path strings.
 */
class SVGDrawer {
  static QUADRATIC = "Q";
  static CUBIC = "C";
  static MOVE_TO = "M";
  static LINE_TO = "L";
  static CLOSE_PATH = "Z";
  
  /**
   * Converts the given points and point types into a valid `Path2D` object.
   * @param {number[][]} points The points of the shape.
   * @param {string[]} mobjectCurveTypes What type of (bezier) curves the given points correspond to.
   * @returns {Path2D}
   */
  static generatePath2D(points, mobjectCurveTypes) {
    /** @type {number} */
    let pointIndex = 0;
    /** @type {string[]} */
    let subPaths = [];
    let curveTypes = ["M"].concat(structuredClone(mobjectCurveTypes));
    // console.log(points);
    // console.log(curveTypes);
    curveTypes.forEach(curveType => {
      if (curveType == SVGDrawer.MOVE_TO) {
        subPaths.push(SVGDrawer.generateMoveToPath(points[pointIndex]));
        pointIndex++;
      }
      if (curveType == SVGDrawer.LINE_TO) {
        subPaths.push(SVGDrawer.generateLineToPath(points[pointIndex]));
        pointIndex++;
      }
      else if (curveType == SVGDrawer.QUADRATIC) {
        subPaths.push(SVGDrawer.generateQuadraticPath(points[pointIndex], points[pointIndex + 1]));
        pointIndex += 2;
      }
      else if (curveType == SVGDrawer.CUBIC) {
        subPaths.push(SVGDrawer.generateCubicPath(points[pointIndex], points[pointIndex + 1], points[pointIndex + 2]));
        pointIndex += 3;
      }
      else if (curveType == SVGDrawer.CLOSE_PATH) {
        subPaths.push("Z");
      }
    });
    
    let paths = { curve: new Path2D(subPaths.join(" ")), onPath: new Path2D(), quadratic: new Path2D(), cubic: new Path2D(), lines: new Path2D() };
    return paths;
  }
  
  /**
   * Generates debug graphics for a given set of points.  
   * - Draws points on the curve as `RED`
   * - Draws quadratic control points as `BLUE`
   * - Draws cubic control points as `GREEN`
   * @param {number[][]} points The points of the shape.
   * @param {string[]} mobjectCurveTypes What type of (bezier) curves the given points correspond to.
   * @returns {{onPath: Path2D, quadratic: Path2D, cubic: Path2D, lines: Path2D}}
   */
  static generateControlPointPath2D(points, mobjectCurveTypes) {
    /** @type {number} */
    let pointIndex = 0;
    /** @type {{curve: string[], onPath: string[], quadratic: string[], cubic: string[], lines: string[]}} */
    let subPaths = { curve: [], onPath: [], quadratic: [], cubic: [], lines: [] }; 
    /** @type {string[]} */
    let curveTypes = ["M"].concat(structuredClone(mobjectCurveTypes));
    /** @type {{onPath: number[][], quadratic: number[][], cubic: number[][]}} */
    let pointFamilies = { onPath: [], quadratic: [], cubic: [] };
    
    curveTypes.forEach(curveType => {
      if (curveType == SVGDrawer.MOVE_TO) {
        subPaths.curve.push(SVGDrawer.generateMoveToPath(points[pointIndex]));
        pointFamilies.onPath.push(points[pointIndex]);
        pointIndex++;
      }
      if (curveType == SVGDrawer.LINE_TO) {
        subPaths.curve.push(SVGDrawer.generateLineToPath(points[pointIndex]));
        pointFamilies.onPath.push(points[pointIndex]);
        pointIndex++;
      }
      else if (curveType == SVGDrawer.QUADRATIC) {
        subPaths.curve.push(SVGDrawer.generateQuadraticPath(points[pointIndex], points[pointIndex + 1]));
        subPaths.lines.push(SVGDrawer.generateMoveToPath(points[pointIndex - 1]));
        subPaths.lines.push(SVGDrawer.generateLineToPath(points[pointIndex]));
        subPaths.lines.push(SVGDrawer.generateLineToPath(points[pointIndex]));
        subPaths.lines.push(SVGDrawer.generateLineToPath(points[pointIndex + 1]));
        pointFamilies.quadratic.push(points[pointIndex]);
        pointFamilies.onPath.push(points[pointIndex + 1]);
        pointIndex += 2;
      }
      else if (curveType == SVGDrawer.CUBIC) {
        subPaths.curve.push(SVGDrawer.generateCubicPath(points[pointIndex], points[pointIndex + 1], points[pointIndex + 2]));
        subPaths.lines.push(SVGDrawer.generateMoveToPath(points[pointIndex - 1]));
        subPaths.lines.push(SVGDrawer.generateLineToPath(points[pointIndex]));
        subPaths.lines.push(SVGDrawer.generateMoveToPath(points[pointIndex + 1]));
        subPaths.lines.push(SVGDrawer.generateLineToPath(points[pointIndex + 2]));
        pointFamilies.cubic.push(points[pointIndex]);
        pointFamilies.cubic.push(points[pointIndex + 1]);
        pointFamilies.onPath.push(points[pointIndex + 2]);
        pointIndex += 3;
      }
      else if (curveType == SVGDrawer.CLOSE_PATH) {
        subPaths.curve.push("Z");
      }
    });
    
    /** @type {{onPath: Path2D, quadratic: Path2D, cubic: Path2D, lines: Path2D}} */
    let paths = { curve: new Path2D(subPaths.curve.join(" ")), onPath: new Path2D(), quadratic: new Path2D(), cubic: new Path2D(), lines: new Path2D(subPaths.lines.join(" ")) };

    const RADIUS = 5;
    
    pointFamilies.onPath.forEach(point => {
      paths.onPath.addPath(new Path2D(SVGDrawer.generateCircle(point, RADIUS)));
    });
    pointFamilies.quadratic.forEach(point => {
      paths.quadratic.addPath(new Path2D(SVGDrawer.generateCircle(point, RADIUS)));
    });
    pointFamilies.cubic.forEach(point => {
      paths.cubic.addPath(new Path2D(SVGDrawer.generateCircle(point, RADIUS)));
    });

    
    return paths;
  }
  
  /**
   * Generates a valid SVG string for a circle composed of two arcs.  
   * Note that this is only used for making circles in `SVGDrawer.generateControlPointPath2D()`.
   * @param {number[]} position Position of the centre of the circle.
   * @param {number} radius Radius of the circle.
   * @returns {string}
   */
  static generateCircle(position, radius) {
    let centreX = position[0];
    let centreY = position[1];
    return `M ${centreX - radius} ${centreY} a ${radius} ${radius} 0 1 0 ${2 * radius} 0  a ${radius} ${radius} 0 1 0 -${2 * radius} 0`;
  }

  /**
   * Generates the string `"M <xPosition> <yPosition>"`.
   * @param {number[]} position Position to move to.
   * @returns {string}
   */
  static generateMoveToPath(position) {
    return `M ${position[0]} ${position[1]}`;
  }

  /**
   * Generates the string `"L <p2XPosition> <p2YPosition>"`.
   * @param {number[]} endPoint End point of the line.
   * @returns {string}
   */
  static generateLineToPath(endPoint) {
    return `L ${endPoint[0]} ${endPoint[1]}`;
  }

  /**
   * Generates the string `"Q <cXPosition> <cYPosition> <p2XPosition> <p2YPosition>"`.
   * @param {number[]} endPoint p2 of the bezier curve.
   * @param {number[]} controlPoint Position of the control point.
   * @returns {string}
   */
  static generateQuadraticPath(controlPoint, endPoint) {
    return `Q ${controlPoint[0]} ${controlPoint[1]} ${endPoint[0]} ${endPoint[1]}`;
  }

  /**
   * Generates the string `"C <c1XPosition> <c1YPosition> <c2XPosition> <c2YPosition> <p2XPosition> <p2YPosition>"`.
   * @param {number[]} endPoint p2 of the bezier curve.
   * @param {number[]} controlPoint1 Position of the control point near the start of the curve..
   * @param {number[]} controlPoint2 Position of the control point near the end of the curve..
   * @returns {string}
   */
  static generateCubicPath(controlPoint1, controlPoint2, endPoint) {
    return `C ${controlPoint1[0]} ${controlPoint1[1]} ${controlPoint2[0]} ${controlPoint2[1]} ${endPoint[0]} ${endPoint[1]}`;
  }
}

export { Renderer2D, SVGDrawer };