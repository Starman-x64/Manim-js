import { Mobject } from "../mobject.js";

class Camera extends Mobject {
  constructor(kwargs={}) {
    super(kwargs);
    console.log(this.points);
  }
  
  generatePoints() {
    this.points = nj.array([[0],[0],[0]]);
    console.log(this.points);
  }
}

/**
 * The area which is visible by the camera.
 */
class Viewport {
  /**
   * 
   * @param {number} width Width of the viewport.
   * @param {number} height Height of the viewport.
   */
  constructor(width, height) {
    /** Width of the viewport.
     * @type {number}
     */
    this.width = width;
    /** Height of the viewport.
     * @type {number}
     */
    this.height = height;
  }
}



export {Camera, Viewport};