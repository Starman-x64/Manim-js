import { Polygon } from "./polygram/polygon.js";
import { Validation, defineUndef } from "../../utils/validation.js";
import { UL, UR, DL, DR } from "../../math.js";

/**
 * Quadrilateral with two sets of parallel sides.
 */
class Rectangle extends Polygon {
  /**
   * 
   * @param {{width: number, height: number}} kwargs Additional arguments to be passed to `Polygon`.
   */
  constructor (kwargs={width: 4, height: 2}) {
    super();

    // Don't initialise the mobject if this mobject is of a child class. Let the child class do it.
    if (Validation.isOfClass(this, "Rectangle")) {
      this._init(kwargs);
    }
  }

  _init(kwargs) {
    super._init([UL, UR, DR, DL], kwargs);
    
    this.stretchToFitWidth(kwargs.width);
    this.stretchToFitHeight(kwargs.height);
  }
}

export { Rectangle };