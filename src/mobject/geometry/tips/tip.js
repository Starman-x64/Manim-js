import { VMobject } from "../../types/vectorizedMobject";

class ArrowTip extends VMobject {
  /** @inheritdoc */
  constructor(kwargs) {
    super(kwargs);

    this.size = kwargs.size;

    this.initMobject();
  }
  generatePoints() {
    let halfSize = this.size/2;
    let hs = halfSize;
    this.points = nj.array([
      [ -hs,  hs,  hs, -hs],
      [ -hs, -hs,  hs,  hs],
      [   0,   0,   0,   0]
    ]);
    this.curveTypes = ["L", "L", "L", "Z"];
  }

}

export { Square };