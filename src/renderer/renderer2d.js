import { VMobject, CapStyleType, LineJoinType } from "../mobject/types/vectorizedMobject.js";
import {Scene} from "../scene/scene.js";
import { WHITE, BLACK, RED, GREEN, BLUE, YELLOW, ORANGE, TRANSPARENT, DARK_RED, DARK_GREEN, DARK_BLUE, DARK_YELLOW, DARK_ORANGE, ManimColor } from "../color/manimColor.js";
import { bezier } from "../utils/bezier.js";
import { Point3D } from "../point3d.js";
import { Validation } from "../utils/validation.js";
import { Text } from "../mobject/text/textMobject.js";

const GLOBAL_SCALE = 20;

/**
 * Handles all the rendering for a 2D scene.  
 * In the future, `Renderer2D` (and `Renderer3D`) will extend a new class `Renderer`.
 */
class Renderer2D {
  /**
   * @param {Scene} scene The scene to render.
   * @param {number} width The width of the canvas.
   * @param {number} height The height of the canvas.
   */
  constructor(scene, width, height) {
    /**
     * The scene to render.
     * @type {Scene}
     */
    this.scene = scene;
    /**
     * The HTML canvas to render the scene to.
     * @type {HTMLCanvasElement}
     * */
    this.canvas = this.createCanvas(width, height);
    /**
     * The (2D) drawing context of the canvas.
     * @type {CanvasRenderingContext2D}
     */
    this.ctx = this.canvas.getContext("2d");
    
    
    this.setCanvasDefaults();
    
    // translate and scale the drawing context so that (0,0) is the centre of the screen, and +y is up.
    //this.ctx.translate(width/2, height/2);;
    //this.ctx.scale(GLOBAL_SCALE, GLOBAL_SCALE);
    /**
     * The last ID returned by `window.requestAnimationFrame()`. Stored so that rendering may be cancelled.
     * @type {number | null}
     */
    this.animationFrameID = null;
    
    /**
     * Time in ms when the frame before last finished rendering.
     * @type {number | null}
     */
    this.previousTimeStamp = null;
    /**
     * Timestamp in ms when rendering began.
     * @type {number | null}
     */
    this.renderStartTimeStamp = null;
  }

  /**
   * Creates new HTMLCanvasElement with the specified width and height to render to.
   * @param {number} width The width of the canvas.
   * @param {number} height The height of the canvas.
   * @returns {HTMLCanvasElement}
   */
  createCanvas(width, height) {
    let canvas = document.createElement("canvas");
    [canvas.width, canvas.height] = [width, height];
    document.body.appendChild(canvas);
    canvas.style = "outline: solid 1px black";
    return canvas;
  }
  
  /**
   * Begin the rendering process by recording the "zero" time (`this.renderStartTimeStamp`) and requesting the first frame.
   * @returns {void}
   */
  beginRendering() {
    // Set the start time
    this.renderStartTimeStamp = document.timeline.currentTime;
    // Request the first frame.
    this.requestNextFrame();
  }
  
  /**
   * Set various default properties of the canvas context.
   * @returns {void}
   */
  setCanvasDefaults() {
    this.ctx.lineCap = CapStyleType.AUTO;
    this.ctx.lineJoin = LineJoinType.AUTO;
  }

  /**
   * Display the FPS in the top left of the screen as `FPS=${1000/dt}`.
   * @param {number} dt Delta time of the last frame.
   * @param {number} precision Number of decimal places to display.
   */
  drawFPS(dt, precision=1) {
    const fps = 1000/dt;
    this.ctx.fillStyle = "white";
    this.ctx.strokeStyle = this.scene.backgroundColor.hex();
    this.ctx.textBaseline = "top";
    this.ctx.lineWidth = 5;
    this.ctx.font = this.ctx.font.replace(/(?<value>\d+\.?\d*)/, 12);
    this.ctx.strokeText(`FPS=${fps.toFixed(precision)}`, 5, 5);
    this.ctx.font = this.ctx.font.replace(/(?<value>\d+\.?\d*)/, 12);
    this.ctx.fillText(`FPS=${fps.toFixed(precision)}`, 5, 5);
  }
  

  /**
   * Convert the position of an object in worldspace to screenspace.
   * @param {number} worldX Worldspace x-coordinate (0 = centre of canvas).
   * @param {number} worldY Worldspace y-coordinate (0 = centre of canvas).
   * @returns {number[]}
   */
  worldToScreenCoords(worldX, worldY) {
    return [(worldX*GLOBAL_SCALE + this.canvas.width/2 - this.scene.camera.x()), -(worldY*GLOBAL_SCALE - this.canvas.height/2- this.scene.camera.y())];
  }
  
  /**
   * Render a frame of animation.
   * @param {number} timeStamp Time in ms when the last frame finished processing.
   */
  renderFrame(timeStamp) {
    const dt = this.calculateDeltaTime(timeStamp);
    
    // Clear the screen
    this.ctx.fillStyle = this.scene.backgroundColor.hex();
    this.ctx.rect(0,0, this.canvas.width, this.canvas.height);
    this.ctx.fill();
    
    // update scene mobjects
    this.updateScene(dt/1000);
    // draw scene mobjects (incl. vmobjects)
    this.drawScene();

    // Draw the FPS on top of everything.
    this.drawFPS(dt);
    this.requestNextFrame();
  }

  /**
   * Update the mobjects in the scene.
   * @param {number} dt Delta time in miliseconds.
   * @returns {void}
   */
  updateScene(dt) {
    this.scene.update(dt);
  }

  /**
   * Draw the scene's mobjects onto the screen.
   * @returns {void}
   */
  drawScene() {
    let camera = this.scene.camera;
    
    this.scene.mobjects.forEach(mob => {
      if (mob instanceof VMobject) {
        this.drawVMobject(mob);
      }
      if (mob instanceof Text) {
        this.drawText(mob);
      }
    });
    
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
      let point = this.worldToScreenCoords(...(mobject.points.slice([i,i+1]).flatten().selection.data));
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
      this.ctx.strokeStyle = WHITE.interpolate(BLACK, 0.25).hex();
      this.ctx.stroke(paths.lines);
      this.ctx.setLineDash([]);

      this.ctx.fillStyle = RED.hex();
      this.ctx.fill(paths.onPath);

      this.ctx.fillStyle = BLUE.hex();
      this.ctx.fill(paths.quadratic);

      this.ctx.fillStyle = GREEN.hex();
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

    let screenCoords = this.worldToScreenCoords(...(mobject.points.selection.data));

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
   * Request the next frame of animation.
   * @returns {void}
   */
  requestNextFrame() {
    this.animationFrameID = window.requestAnimationFrame((t) => this.renderFrame(t));
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
   * Cancel calls to `window.requestAnimationFrame()`.
   * @returns {void}
   */
  cancelRendering() {
    while(this.animationFrameID--) {
      window.cancelAnimationFrame(this.animationFrameID);
    }
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