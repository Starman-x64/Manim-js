import {Renderer2D} from "../renderer/renderer2d.js";
import {Camera} from "../mobject/camera/camera.js";
import {Mobject} from "../mobject/mobject.js";
import { ManimColor, WHITE, BLACK, RED, GREEN, BLUE, YELLOW, ORANGE, TRANSPARENT, DARK_RED, DARK_GREEN, DARK_BLUE, DARK_YELLOW, DARK_ORANGE } from "../color/manimColor.js";

/**
 * An abstract class for all ManimJs scenes.  
 * This class is extended to create scenes which contain all the logic of how it should play.
 * @abstract
 */
class Scene {
  /**
   * @param {number} width The width of the canvas.
   * @param {number} height The height of the canvas.
   */
  constructor(width, height) {
    /**
     * All the mobjects in the scene (excluding the camera);
     * @type {Mobject[]}
     */
    this.mobjects = [];
    //this.animationQueue = [];
    /**
     * The renderer for the scene. Each scene has one renderer, and each renderer has one scene.
     * @type {Renderer2D}
     */
    this.renderer = new Renderer2D(this, width, height);
    /**
     * The scene camera.
     * @type {Camera}
     */
    this.camera = new Camera();

    /**
     * The background color.
     * @type {ManimColor}
     */
    this.backgroundColor = BLACK.interpolate(BLUE, 0.1);
  }

  /**Add content to the Scene.
   * 
   * From within `Scene.construct`, display mobjects on screen by calling
   * `Scene.add()` and remove them from screen by calling `Scene.remove()`.
   * All mobjects currently on screen are kept in `Scene.mobjects`.  Play
   * animations by calling `Scene.play()`.
   * 
   * Initialization code should go in `Scene.setup()`.  Termination code should
   * go in `Scene.tear_down()`.
   * 
   * A typical manim script includes a class derived from `Scene` with an
   * overridden `Scene.contruct()` method:
   * @example
   * class MyScene extends Scene {
   *  construct() {
   *    this.play(Write(Text("Hello World!")));
   *  }
   * }
   */
  construct() {
    
  }
  
  /**Start the scene.  
   * Calling this function runs the renderer.
   * 
   */
  run() {
    // Run the renderer.
    this.renderer.beginRendering();
  }

  /**Begins updating all mobjects in the Scene.
   * 
   * @param {number} dt Change in time between updates. Defaults (mostly) to `1/framesPerSecond`.
   */
  updateMobjects(dt) {
    //this.mobjects.forEach(mobject => mobject.update(dt));
    this.camera.update(dt);
  }

  /**Add mobjects to scene.
   * 
   * Mobjects will be displayed, from background to
   * foreground in the order with which they are added.
   * 
   * If a mobject has already been added, it will be
   * removed and added again at its new position among
   * the other new mobjects.
   * 
   * @param  {...Mobject} mobjects The mobjects to add.
   * @returns {this}
   */
  add(...mobjects) {
    this.mobjects = this.mobjects.filter(mobject => !mobjects.includes(mobject));
    this.mobjects = this.mobjects.concat(mobjects);

    return this;
  }

  /**Removes mobjects in the passed list of mobjects
   * from the scene and the foreground, by removing them
   * from "mobjects" and "foreground_mobjects".
   * 
   * @param  {...any} mobjects The mobjects to remove.
   * @returns {this}
   */
  remove(...mobjects) {
    this.mobjects = this.mobjects.filter(mobject => !mobjects.includes(mobject));
    this.foregroundMobjects = this.foregroundMobjects.filter(mobject => !mobjects.includes(mobject));
    
    return this;
  }

  /**Removes all mobjects present in `this.mobjects`
   * and `this.foregroundMobjects` from the scene.
   * 
   * @returns {this}
   */
  clear() {
    this.mobjects = [];
    this.foregroundMobjects = [];

    return this;
  }

}

export {Scene};