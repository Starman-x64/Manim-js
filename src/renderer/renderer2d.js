import {Scene} from "../scene/scene.js";

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
   */
  beginRendering() {
    // Set the start time
    this.renderStartTimeStamp = document.timeline.currentTime;
    // Request the first frame.
    this.requestNextFrame();
  }

  /**
   * Display the FPS in the top left of the screen as `FPS=${1000/dt}`.
   * @param {number} dt Delta time of the last frame.
   * @param {number} precision Number of decimal places to display.
   */
  drawFPS(dt, precision=1) {
    const fps = 1000/dt;
    this.ctx.fillStyle = "black";
    this.ctx.strokeStyle = "white";
    this.ctx.textBaseline = "top";
    this.ctx.lineWidth = 5;
    this.ctx.font = this.ctx.font.replace(/(?<value>\d+\.?\d*)/, 12);
    this.ctx.strokeText(`FPS=${fps.toFixed(precision)}`, 0, 0);
    this.ctx.font = this.ctx.font.replace(/(?<value>\d+\.?\d*)/, 12);
    this.ctx.fillText(`FPS=${fps.toFixed(precision)}`, 0, 0);
  }
  
  /**
   * Render a frame of animation.
   * @param {number} timeStamp Time in ms when the last frame finished processing.
   */
  renderFrame(timeStamp) {
    const dt = this.calculateDeltaTime(timeStamp);
    
    // Clear the screen
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fill();
    
    // update scene mobjects
    this.updateScene(dt);
    // draw scene mobjects (incl. vmobjects)
    this.drawScene();

    // Draw the FPS on top of everything.
    this.drawFPS(dt);
    this.requestNextFrame();
  }

  /**
   * Update the mobjects in the scene.
   * @param {number} dt Delta time.
   * @returns {void}
   */
  updateScene(dt) {
    this.scene.updateMobjects(dt);
  }

  /**
   * Draw the scene's mobjects onto the screen.
   * @returns {void}
   */
  drawScene() {
    
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
   * @param {number} timeStamp Time in ms when the last frame finished processing.
   * @returns {number} Delta time `dt`.
   */
  calculateDeltaTime(timeStamp) {
    if (this.previousTimeStamp === null) {
      this.previousTimeStamp = this.renderStartTimeStamp;
    }
    let dt = timeStamp - this.previousTimeStamp;
    this.previousTimeStamp = timeStamp;
    return dt;
  }
  
  /**
   * Cancel calls to `window.requestAnimationFrame()`.
   */
  cancelRendering() {
    while(this.animationFrameID--) {
      window.cancelAnimationFrame(this.animationFrameID);
    }
  }
}

export {Renderer2D};