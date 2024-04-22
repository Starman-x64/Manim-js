import { Polygon } from "./polygram/polygon.js";
import { Point3D } from "../../point3d.js";
import { Validation } from "../../utils/validation.js";

class Square extends Polygon {
  /** @inheritdoc */
  constructor(kwargs={}) {
    //console.log(points.map(x => x.toString()));
    super();

    // Don't initialise the mobject if this mobject is of a child class. Let the child class do it.
    if (Validation.isOfClass(this, "Square")) {
      this._init(kwargs);
    }
  }

  _init(kwargs) {
    let halfSize = 0.5;
    let hs = halfSize;
    let vertices = [
      Point3D(-hs, hs, 0),
      Point3D( hs, hs, 0),
      Point3D( hs,-hs, 0),
      Point3D(-hs,-hs, 0),
      Point3D(-hs, hs, 0),
    ];

    super._init(vertices, kwargs);
  }

}

export { Square };