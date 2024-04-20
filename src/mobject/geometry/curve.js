import { Point3D } from "../../point3d.js";
import { defineUndef } from "../../utils/validation.js";
import { VMobject } from "../types/vectorizedMobject.js";

class Curve extends VMobject {
  /** @inheritdoc */
  constructor(kwargs) {
    super(kwargs);

    this.curveTypes = defineUndef(kwargs.curveTypes, []);
    
    this.initMobject();
    this.points = nj.stack(defineUndef(kwargs.points, [Point3D(0, 0, 0)]).map(x => nj.array(x)));
  }
  generatePoints() { 
    //this.points = nj.array([[-300, -200, -100, 0, 100, 200, 300], [0, 50, 0, 0, 50, -50, 0], [0, 0, 0, 0, 0, 0, 0]]);
    //this.curveTypes = ["Q","L","C"];
  }

}

export { Curve };