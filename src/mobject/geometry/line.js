import { LEFT, RIGHT } from "../../math.js";
import { defineUndef } from "../../utils/validation.js";
import { TippableVMobject } from "../types/tippableVMobject.js";
import { ArrowTriangleFilledTip } from "./tips/tip.js";

class Line extends TippableVMobject {
  /** @inheritdoc */
  constructor(kwargs) {
    super(kwargs);

    /** @type {Ndarray} */
    this.start = defineUndef(kwargs.start, LEFT);
    /** @type {Ndarray} */
    this.end = defineUndef(kwargs.end, RIGHT);

    // Don't initialise the mobject if this mobject is of a child class. Let the child class do it.
    if (this.constructor.name == "Line") {
      this.initMobject();
    }
  }
  
  generatePoints() {
    this.points = nj.stack([this.start, this.end]);
    this.curveTypes = ["L"];
  }

}

class Arrow extends Line {
  constructor(kwargs) {
    super(kwargs);

    /** @type {number} */
    this.maxTipToLengthRatio = defineUndef(kwargs.maxTipToLengthRatio, 0.25);
    /** @type {number} */
    this.maxStrokeWidthToLengthRatio = defineUndef(kwargs.maxStrokeWidthToLengthRatio, 5);
    /** @type {typeof ArrowTip} */
    let tipShape = defineUndef(kwargs.tipShape, ArrowTriangleFilledTip);

    /** @type {number} */
    this.initialStrokeWidth = this.strokeWidth;

    // Don't initialise the mobject if this mobject is of a child class. Let the child class do it.
    if (this.constructor.name == "Arrow") {
      this.initMobject();
    }
    
    this.addTip({ tipShape: tipShape });
  }
}

export { Line, Arrow };