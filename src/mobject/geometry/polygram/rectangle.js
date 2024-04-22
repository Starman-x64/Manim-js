import { Polygon } from "./polygon.js";
import { defineUndef } from "../../../utils/validation.js";
import { UL, UR, DL, DR } from "../../../math.js";

/**
 * Quadrilateral with two sets of parallel sides.
 */
class Rectangle extends Polygon {
  /**
   * 
   * @param {{}} kwargs Additional arguments to be passed to `Polygon`.
   */
  constructor (kwargs={width: 4, height: 2}) {
    super([UL, UR, DR, DL], kwargs);

    // Don't initialise the mobject if this mobject is of a child class. Let the child class do it.
    if (this.constructor.name == "Rectangle") {
      this.initMobject();
    }
    
    this.stretchToFitWidth(kwargs.width);
    this.stretchToFitHeight(kwargs.height);
  }
}

export { Rectangle };