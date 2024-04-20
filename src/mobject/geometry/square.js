import { Polygon } from "./polygram/polygon.js";
import { Point3D } from "../../point3d.js";

class Square extends Polygon {
  /** @inheritdoc */
  constructor(kwargs) {
    let halfSize = 0.5;
    let hs = halfSize;
    let points = [
      Point3D(-hs, hs, 0),
      Point3D( hs, hs, 0),
      Point3D( hs,-hs, 0),
      Point3D(-hs,-hs, 0),
      Point3D(-hs, hs, 0),
    ]
    //console.log(points.map(x => x.toString()));
    super(points, kwargs);

    // Don't initialise the mobject if this mobject is of a child class. Let the child class do it.
    if (this.constructor.name == "Square") {
      this.initMobject();
    }
  }

}

export { Square };