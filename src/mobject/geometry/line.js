import { TippableVMobject } from "../types/tippableVMobject.js";

class Line extends TippableVMobject {
  /** @inheritdoc */
  constructor(kwargs) {
    super(kwargs);

    /** @type {Ndarray} */
    this.startPoint = kwargs.startPoint;
    /** @type {Ndarray} */
    this.endPoint = kwargs.endPoint;

    this.initMobject();
  }
  generatePoints() {
    this.points = nj.concatenate(this.startPoint, this.endPoint);
    this.curveTypes = ["L"];
  }

}

export { Line };