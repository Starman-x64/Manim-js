import { RegularPolygon } from "./regularPolygon.js";
import { defineUndef } from "../../../utils/validation.js";
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
    kwargs.startAngle = defineUndef(kwargs.startAngle, -PI/6);
    super(3, kwargs);

    // Don't initialise the mobject if this mobject is of a child class. Let the child class do it.
    if (this.constructor.name == "Triangle") {
      this.initMobject();
    }
  }
}

export { Triangle };