import { Rectangle } from "./rectangle.js";
import { Point3D } from "../../point3d.js";
import { Validation, defineUndef } from "../../utils/validation.js";
import { UL, UR, DL, DR } from "../../math.js";

class Square extends Rectangle {
  /** @inheritdoc */
  constructor(kwargs={width: 4}) {
    //console.log(points.map(x => x.toString()));
    super();

    // Don't initialise the mobject if this mobject is of a child class. Let the child class do it.
    if (Validation.isOfClass(this, "Square")) {
      this._init(kwargs);
    }
  }

  _init(kwargs) {
    // Yes, future me, both of these should be (kwargs.width, 4).
    kwargs.width = defineUndef(kwargs.width, 4);
    kwargs.height = defineUndef(kwargs.width, 4);
    
    super._init(kwargs);
  }

}

export { Square };