import { WHITE, BLACK, RED, GREEN, BLUE, YELLOW, ORANGE, TRANSPARENT, ManimColor } from "../color/manimColor.js";
import { Mobject } from "../mobject/mobject.js";
import { TextAlign, TextBaseline } from "../mobject/text/textMobject.js";
import { bezier } from "../utils/bezier.js";
import { Validation, defineUndef } from "../utils/validation.js";
import { Drawer } from "./drawer.js";

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
    this.backgroundColor = BLACK.interpolate(BLUE, 0.1);
  }

  get width() { return this._canvas.width; }
  get height() { return this._canvas.height; }
  set width(newWidth) { this._canvas.width = newWidth; }
  set height(newHeight) { this._canvas.height = newHeight; }
    
  /**
   * Clear the canvas.
   * @returns {this}
   */
  clear() {
    return this;
  }  
  
  /**
   * Execute the sequence of draw instructions.  
   * The functions that can be run are the drawing functions of this class.
   * @param {Function[]} drawInstructions The sequence of instructions to execute.
   * @returns {this}
   */
  draw(drawInstructions) {
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

  /** @returns {Number} */
  get lineSpacing() { return this._ctx.lineSpacing; }
  /** @param {Number} newSpacing */
  set lineSpacing(newSpacing) { this._ctx.lineSpacing = newSpacing; }

  /** @returns {Number} */
  get textAlign() { return this._ctx.textAlign; }
  /** @param {TextAlign} newAlign */
  set textAlign(newAlign) { this._ctx.textAlign = newAlign; }
  
  /** @returns {Number} */
  get textBaseline() { return this._ctx.textBaseline; }
  /** @param {TextBaseline} newBaseline */
  set textBaseline(newBaseline) { this._ctx.textBaseline = newBaseline; }
  
  /** @returns {Number} */
  get font() { return this._ctx.font; }
  /** @param {String} newFont */
  set font(newFont) { this._ctx.font = newFont; }
    
  /**
   * @returns {this}
   */
  clear() {
    this._ctx.fillStyle = this.backgroundColor.hex;
    this._ctx.rect(0,0, this.width, this.height);
    this._ctx.fill();
    return this;
  }
  
  /**
   * @param {Path2D} path 
   * @returns {this}
   */
  stroke(path=null) {
    this._ctx.stroke(path);
    return this;
  }
  
  /**
   * @param {Path2D} path 
   * @returns {this}
   */
  fill(path=null) {
    this._ctx.fill(path);
    return this;
  }
  
  /**
   * @param {String} text 
   * @param {Number} x 
   * @param {Number} y 
   * @param {Number | undefined} maxWidth 
   * @returns {this}
   */
  strokeText(text, x, y, maxWidth=undefined) {
    this._ctx.strokeText(text, x, y, maxWidth);
    return this;
  }
  
  /**
   * @param {String} text 
   * @param {Number} x 
   * @param {Number} y 
   * @param {Number | undefined} maxWidth 
   * @returns {this}
   */
  fillText(text, x, y, maxWidth=undefined) {
    this._ctx.fillText(text, x, y, maxWidth);
    return this;
  }

  /**
   * Draw the given `Mobject`.  
   * Get a sequence of draw instructions and execute them.  
   * The functions that can be run are the drawing functions of this class.
   * @param {Mobject} ghostMobject The ghost of the `Mobject` to draw.
   * @returns {this}
   */
  draw(ghostMobject) {
    let drawInstructions = Drawer.generateDrawInstructions(ghostMobject, this);
    drawInstructions.forEach(instruction => {
      instruction();
    });
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

export { Canvas, Canvas2D };