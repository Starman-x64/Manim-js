import { VMobject } from "../types/vectorizedMobject.js";

class Curve extends VMobject {
  /** @inheritdoc */
  constructor(kwargs) {
    super(kwargs);

    this.initMobject();
  }
  generatePoints() {
    let hs = 100/2; // half the width/size/side length
    this.points = nj.array([[-300, -200, -100, 0, 100, 200, 300], [0, 50, 0, 0, 50, -50, 0], [0, 0, 0, 0, 0, 0, 0]]);
    this.curveTypes = ["Q","L","C"];
  }

}

export { Curve };