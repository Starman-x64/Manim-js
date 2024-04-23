import { Validation, defineUndef } from "../../utils/validation.js";
import { VMobject } from "../types/vectorizedMobject.js";

class Circle extends VMobject {
  /** @inheritdoc */
  constructor(kwargs={}) {
    super();

    // Don't initialise the mobject if this mobject is of a child class. Let the child class do it.
    if (Validation.isOfClass(this, "Circle")) {
      this._init(kwargs);
    }
  }

  _init(kwargs) {
    this.radius = defineUndef(kwargs.radius, 1);

    super._init(kwargs);
  }

  generatePoints() {
    let controlpointDistance = this.radius * 4 * (Math.sqrt(2) - 1) / 3;
    let r = this.radius;
    let d = controlpointDistance;
    
    this.points = nj.array([
      [-r,  0,  0],
      [-r,  d,  0],
      [-d,  r,  0],
      [ 0,  r,  0],
      [ d,  r,  0],
      [ r,  d,  0],
      [ r,  0,  0],
      [ r, -d,  0],
      [ d, -r,  0],
      [ 0, -r,  0],
      [-d, -r,  0],
      [-r, -d,  0],
      [-r,  0,  0],
    ]);
    this.curveTypes = ["C", "C", "C", "C", "Z"];
  }

}

export { Circle };