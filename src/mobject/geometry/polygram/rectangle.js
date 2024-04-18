import { Polygon } from "./polygon.js";
import { defineUndef } from "../../../utils/validation.js";
import { PI } from "../../../constants.js";
import { UL, UR, DL, DR } from "../../../constants.js";

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
    
    this.scaleToFitWidth(kwargs.width);
    this.scaleToFitHeight(kwargs.height);
    console.log(this.width());
  }
}

export { Rectangle };