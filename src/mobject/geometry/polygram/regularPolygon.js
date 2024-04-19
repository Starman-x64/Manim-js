import { Polygon } from "./polygon.js";
import { PI, TAU } from "../../../constants.js";
import { Point3D } from "../../../point3d.js";

class RegularPolygon extends Polygon {
  /**
   * 
   * @param {number} n The number of sides of the `RegularPolygon`.
   * @param {{startAngle: number, radius: number}} kwargs Forwarded to the parent constructor.
   */
  constructor(n, kwargs={}) {
    /** @type {Ndarray[]} */
    let vertices = [];
    /** @type {number} */
    let radius = kwargs.radius ? kwargs.radius : 0.5;
    /** @type {number} */
    let startAngle = kwargs.startAngle ? kwargs.startAngle : 0;
    
    n = n ? n : 6;

    for (let i = 0; i < n; i++) {
      let angle = startAngle + i * TAU/n;
      vertices.push(Point3D(radius * Math.cos(angle),radius * Math.sin(angle), 0));
    }
     

    super(vertices, kwargs);

    // Don't initialise the mobject if this mobject is of a child class. Let the child class do it.
    if (this.constructor.name == "RegularPolygon") {
      this.initMobject();
    }
  }
}

export { RegularPolygon };