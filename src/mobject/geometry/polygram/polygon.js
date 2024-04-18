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
    // make sure the last point is the first point so the shape closes.
    if (vertices[0].flatten().selection.data.toString() != vertices[vertices.length - 1].flatten().selection.data.toString()) {
      vertices.push(vertices[0]);
    }
    // console.log(vertices);
    super([vertices], kwargs);
    
    // Don't initialise the mobject if this mobject is of a child class. Let the child class do it.
    if (this.constructor.name == "Polygon") {
      this.initMobject();
    }
  }
}

export { Polygon };