import { Validation } from "../../utils/validation.js";
import { Mobject } from "../mobject.js";

class Camera extends Mobject {
  constructor(kwargs={}) {
    super();

    if (Validation.isOfClass(this, "Camera")) {
      this._init(kwargs);
    }
  }
  
  generatePoints() {
    this.points = nj.array([[0],[0],[0]]);
  }
  
  /**
   * x-position of the camera.
   * @return {number}
   */
  x = () => this.points.get(0,0);
  /**
   * y-position of the camera.
   * @return {number}
   */
  y = () => this.points.get(1,0);
  /**
   * z-position of the camera.
   * @return {number}
   */
  z = () => this.points.get(2,0);
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