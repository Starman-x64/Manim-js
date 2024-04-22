import { Polygon } from "./polygon.js";
import { PI, TAU } from "../../../math.js";
import { Point3D } from "../../../point3d.js";
import { Validation } from "../../../utils/validation.js";

class RegularPolygon extends Polygon {
  /**
   * 
   * @param {number} n The number of sides of the `RegularPolygon`.
   * @param {{startAngle: number, radius: number}} kwargs Forwarded to the parent constructor.
   */
  constructor(n, kwargs={}) {
    super();

    // Don't initialise the mobject if this mobject is of a child class. Let the child class do it.
    if (Validation.isOfClass(this, "RegularPolygon")) {
      this._init(n, kwargs);
    }
  }

  _init(n, kwargs) {
    /** @type {Ndarray[]} */
    let vertices = [];
    /** @type {number} */
    let radius = kwargs.radius ? kwargs.radius : 2;
    /** @type {number} */
    let startAngle = kwargs.startAngle ? kwargs.startAngle : 0;

    n = n ? n : 6;

    for (let i = 0; i < n; i++) {
      let angle = startAngle + i * TAU/n;
      vertices.push(Point3D(radius * Math.cos(angle),radius * Math.sin(angle), 0));
    }

    super._init(vertices, kwargs);
  }
}

export { RegularPolygon };