import { RegularPolygon } from "./regularPolygon.js";
import { Validation, defineUndef } from "../../../utils/validation.js";
import { PI } from "../../../math.js";

/**
 * An equilateral triangle.
 */
class Triangle extends RegularPolygon {
  /**
   * 
   * @param {{}} kwargs Additional arguments to be passed to `RegularPolygon`.
   */
  constructor (kwargs={}) {
    super();

    // Don't initialise the mobject if this mobject is of a child class. Let the child class do it.
    if (Validation.isOfClass(this, "Triangle")) {
      this._init(kwargs);
    }
  }
  
  _init(kwargs) {
    kwargs.startAngle = defineUndef(kwargs.startAngle, -PI/6);
    super._init(3, kwargs);
  }
}

export { Triangle };