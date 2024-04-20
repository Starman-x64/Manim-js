import { WHITE } from "../../color/manimColor.js";
import { defineUndef } from "../../utils/validation.js";
import { VMobject } from "../types/vectorizedMobject.js";
import { Circle } from "./circle.js";

const DEFAULT_POINT_RADIUS = 0.05;

class Point extends Circle {
  /** @inheritdoc */
  constructor(kwargs) {
    kwargs.fillColor = defineUndef(kwargs.fillColor, WHITE);
    kwargs.strokeColor = defineUndef(kwargs.strokeColor, kwargs.fillColor);
    super(kwargs);

    this.initMobject();
  }
  generatePoints() {
    let controlpointDistance = DEFAULT_POINT_RADIUS * 4 * (Math.sqrt(2) - 1) / 3;
    let r = DEFAULT_POINT_RADIUS;
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

export { Point };