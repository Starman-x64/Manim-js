import { VMobject } from "../types/vectorizedMobject.js";

class Circle extends VMobject {
  /** @inheritdoc */
  constructor(kwargs) {
    super(kwargs);

    this.radius = kwargs.radius;

    this.initMobject();
  }
  generatePoints() {
    let controlpointDistance = this.radius * 4 * (Math.sqrt(2) - 1) / 3;
    let r = this.radius;
    let d = controlpointDistance;
    
    this.points = nj.array([
      [-r, -r, -d,  0,  d,  r,  r,  r,  d,  0, -d, -r, -r],
      [ 0,  d,  r,  r,  r,  d,  0, -d, -r, -r, -r, -d,  0],
      [ 0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]
    ]);
    this.curveTypes = ["C", "C", "C", "C", "Z"];
  }

}

export { Circle };