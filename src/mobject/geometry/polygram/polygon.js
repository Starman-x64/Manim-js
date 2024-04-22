import { Validation } from "../../../utils/validation.js";
import { Polygram } from "./polygram.js";

/**
 * 
 */
class Polygon extends Polygram {
  /**
   * 
   * @param {Ndarray[]} vertices The vertices of the `Polygon`.
   * @param {{}} kwargs Forwarded to the parent constructor.
   */
  constructor(vertices, kwargs) {
    super();
    
    // Don't initialise the mobject if this mobject is of a child class. Let the child class do it.
    if (Validation.isOfClass(this, "Polygon")) {
      this._init(vertices, kwargs);
    }
  }
  
  _init(vertices, kwargs) {
    // make sure the last point is the first point so the shape closes.
    if (vertices[0].flatten().selection.data.toString() != vertices[vertices.length - 1].flatten().selection.data.toString()) {
      vertices.push(vertices[0]);
    }
    super._init([vertices], kwargs);
  }
}

export { Polygon };