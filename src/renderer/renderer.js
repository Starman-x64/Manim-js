import { VMobject, CapStyleType, LineJoinType } from "../mobject/types/vectorizedMobject.js";
import {Scene} from "../scene/scene.js";
import { WHITE, BLACK, RED, GREEN, BLUE, YELLOW, ORANGE, TRANSPARENT, ManimColor } from "../color/manimColor.js";
import { bezier } from "../utils/bezier.js";
import { Validation, defineUndef } from "../utils/validation.js";
import { Mobject, MobjectReference } from "../mobject/mobject.js";
import { Canvas, Canvas2D } from "./canvas.js";
import { Drawer, VMobjectDrawer, SVGDrawer } from "./drawer.js";

const GLOBAL_SCALE = 20;


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
   * Update the `Scene`.
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
   * @returns {void}
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
    
    /** @type {Canvas2D} */
    this.canvas;
    
    this.canvas.backgroundColor = this.scene.backgroundColor;
  }
  
  /**
   * Display the FPS in the top left of the screen as `FPS=${1000/dt}`.
   * @param {number} dt Delta time of the last frame.
   * @param {number} precision Number of decimal places to display.
  */
 drawFPS(dt, precision=1) {
   const fps = 1000/dt;
   this.canvas.fillStyle = WHITE;
   this.canvas.strokeStyle = this.scene.backgroundColor;
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
    mobject.obj.getFamily().forEach(submobject => {
      let ghostMobject = submobject.obj.clone(true);
      ghostMobject.points = this.worldToCanvasCoords(ghostMobject.points);
      this.canvas.draw(ghostMobject);
    });
  }
  
  /**
   * Convert the position of an object in world-space to canvas-space.
   * @param {Number[][]} worldPoints World-space coordinates.
   * @returns {Number[]}
  */
  worldToCanvasCoords(worldPoints) {
    let worldPointsAsMatrix = worldPoints.map(x => [x[0], x[1], 1]);
    let transformationMatrix = [
      [GLOBAL_SCALE, 0, 0],
      [0, -GLOBAL_SCALE, 0],
      [this.canvas.width/2 - this.scene.camera.x, this.canvas.height/2 + this.scene.camera.y, 1]
    ];
    let resultantPoints = math.multiply(worldPointsAsMatrix, transformationMatrix);
    resultantPoints = resultantPoints.map(x => [x[0], x[1]]);
    return resultantPoints;
  }

  /**
   * Convert the position of an object from canvas-space to world-space.
   * @param {Number[][]} canvasPoints Canvas-space coordinates.
   * @returns {Number[]}
  */
  canvasToWorldCoords(canvasPoints) {
    let canvasPointsAsMatrix = canvasPoints.map(x => [...x, 1]);
    let transformationMatrix = math.inv([
      [GLOBAL_SCALE, 0, 0],
      [0, -GLOBAL_SCALE, 0],
      [this.canvas.width/2 - this.scene.camera.x, this.canvas.height/2 + this.scene.camera.y, 1]
    ]);
    let resultantPoints = math.multiply(canvasPointsAsMatrix, transformationMatrix).map(x => { x.pop(); return [...x, 0]; });
    return resultantPoints;
  }
  
    /**
     * Set various default properties of the canvas context.
     * @returns {void}
     */
    setCanvasDefaults() {
      // this.canvas.lineCap = CapStyleType.AUTO;
      // this.canvas.lineJoin = LineJoinType.AUTO;
    }
  
  // /**
  //  * Draws the given `VMobject`.  
  //  * Handled differently from `GMobject`s (graphic mobjects) because VMobjects are drawn with `Path2D`.
  //  * @param {VMobject} mobject The `VMobject` to draw.
  //  * @returns {void}
  //  */
  // drawVMobject(mobject) {
  //   // console.log("Drawing", mobject.name); 
  //   /** @type {string[]} */
  //   let curveTypes = mobject.curveTypes;
  //   /** @type {number[][]} */
  //   let points = [];
  //   for(let i = 0; i < mobject.points.shape[0]; i++) {
  //     let point = this.worldToCanvasCoords(...(mobject.points.slice([i,i+1]).flatten().selection.data));
  //     points.push(point);
  //   }

  //   /** @type {boolean} */
  //   let drawFill = !!(mobject.fillColor.alpha() * mobject.fillOpacity);
  //   /** @type {boolean} */
  //   let drawStroke = !!(mobject.strokeColor.alpha() * mobject.strokeOpacity);

  //   /** @type {ManimColor} */
  //   let fillColor = mobject.fillColor.toString("rgba");
  //   /** @type {ManimColor} */
  //   let strokeColor = mobject.strokeColor.toString("rgba");


  //   /** @type {{onPath: Path2D, quadratic: Path2D, cubic: Path2D, lines: Path2D}} */
  //   let paths;
  //   if (mobject.drawBezierHandles) {
  //     paths = SVGDrawer.generateControlPointPath2D(points, curveTypes);
  //   }
  //   else {
  //     paths = SVGDrawer.generatePath2D(points, curveTypes);
  //   }

  //   this.ctx.strokeStyle = strokeColor;
  //   this.ctx.fillStyle = fillColor;
  //   if (drawStroke) {
  //     this.ctx.setLineDash(mobject.lineDash);
  //     this.ctx.lineWidth = mobject.strokeWidth;
  //     this.ctx.stroke(paths.curve);
  //   }
  //   if (drawFill) {
  //     this.ctx.fill(paths.curve);
  //   }
    
  //   if (mobject.drawBezierHandles) {
  //     this.ctx.setLineDash([5, 5]);
  //     this.ctx.lineWidth = 1;
  //     this.ctx.strokeStyle = WHITE.interpolate(BLACK, 0.25).hex;
  //     this.ctx.stroke(paths.lines);
  //     this.ctx.setLineDash([]);

  //     this.ctx.fillStyle = RED.hex;
  //     this.ctx.fill(paths.onPath);

  //     this.ctx.fillStyle = BLUE.hex;
  //     this.ctx.fill(paths.quadratic);

  //     this.ctx.fillStyle = GREEN.hex;
  //     this.ctx.fill(paths.cubic);
  //   }
    
  //   // Now draw each of the submobjects
  //   mobject.submobjects.forEach(mob => {
  //     this.drawVMobject(mob);
  //   });
  // }
  
  // /**
  //  * Draws the given `Text` mobject.  
  //  * @param {Text} mobject The `Text` to draw.
  //  * @returns {void}
  //  */
  // drawText(mobject) {
  //   if(mobject.opacity == 0) return;
  //   mobject.color.setAlpha(mobject.fillOpacity * mobject.opacity);

  //   let screenCoords = this.worldToCanvasCoords(...(mobject.points.selection.data));

  //   /** @type {ManimColor} */
  //   let color = mobject.color.toString("rgba");
    
  //   this.ctx.font = mobject.getCanvasFontStyleString();
  //   this.ctx.fillStyle = color;
  //   this.ctx.textAlign = mobject.align;
  //   this.ctx.textBaseline = mobject.baseline;
  //   this.ctx.fillText(mobject.text, screenCoords[0], screenCoords[1]);
    
  //   // Now draw each of the submobjects
  //   mobject.submobjects.forEach(mob => {
  //     this.drawText(mob);
  //   });
  // }

}



export { Renderer2D };