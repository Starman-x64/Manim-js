import { VMobject } from "../types/vectorizedMobject.js";
import { Circle } from "./circle.js";

const DEFAULT_POINT_RADIUS = 5;

class Point extends Circle {
  /** @inheritdoc */
  constructor(kwargs) {
    super(kwargs);

    this.initMobject();
  }
  generatePoints() {
    let controlpointDistance = DEFAULT_POINT_RADIUS * 4 * (Math.sqrt(2) - 1) / 3;
    let r = DEFAULT_POINT_RADIUS;
    let d = controlpointDistance;
    
    this.points = nj.array([
      [-r, -r, -d,  0,  d,  r,  r,  r,  d,  0, -d, -r, -r],
      [ 0,  d,  r,  r,  r,  d,  0, -d, -r, -r, -r, -d,  0],
      [ 0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]
    ]);
    this.curveTypes = ["C", "C", "C", "C", "Z"];
  }

}

export { Point };