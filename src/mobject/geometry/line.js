import { LEFT, RIGHT } from "../../math.js";
import { Validation, defineUndef } from "../../utils/validation.js";
import { TippableVMobject } from "../types/tippableVMobject.js";
import { ArrowTriangleFilledTip } from "./tips/tip.js";

class Line extends TippableVMobject {
  /** @inheritdoc */
  constructor(kwargs) {
    super();

    // Don't initialise the mobject if this mobject is of a child class. Let the child class do it.
    if (Validation.isOfClass(this, "Line")) {
      this._init(kwargs);
    }
  }

  _init(kwargs) {
    /** @type {Ndarray} */
    this.start = defineUndef(kwargs.start, LEFT);
    /** @type {Ndarray} */
    this.end = defineUndef(kwargs.end, RIGHT);

    super._init(kwargs);
  }
  
  generatePoints() {
    // console.log(this.start.toString());
    // console.log(this.end.toString());
    this.points = nj.stack([this.start, this.end]);
    this.curveTypes = ["L"];
  }

  /**
   * Sets the start and end coordinates of a line.
   * @param {Ndarray} start The new start coordinate.
   * @param {Ndarray} end The new end coordinate.
   * @returns {this}
   */
  putStartAndEndOn(start, end) {
    // console.log("LINE!!!");
    let [currStart, currEnd] = this.getStartAndEnd();
    // console.log(currStart.toString());
    // console.log(currEnd.toString());
    // console.log(start.toString());
    // console.log(end.toString());
    
    if (currStart != currEnd) {
      this.start = start;
      this.end = end;
      this.generatePoints();
    }
    //return super.putStartAndEndOn(start, end);
    return this;
  }

}

class Arrow extends Line {
  constructor(kwargs) {
    super(kwargs);

    // Don't initialise the mobject if this mobject is of a child class. Let the child class do it.
    if (Validation.isOfClass(this, "Arrow")) {
      this._init(kwargs);
    }
  }

  _init(kwargs) {
/** @type {number} */
    this.maxTipToLengthRatio = defineUndef(kwargs.maxTipToLengthRatio, 0.25);
    /** @type {number} */
    this.maxStrokeWidthToLengthRatio = defineUndef(kwargs.maxStrokeWidthToLengthRatio, 5);
    /** @type {number} */
    this.initialStrokeWidth = this.strokeWidth;

    
    /** @type {typeof ArrowTip} */
    let tipShape = defineUndef(kwargs.tipShape, ArrowTriangleFilledTip);

    super._init(kwargs);
    
    this.addTip({ tipShape: tipShape });
  }
}

export { Line, Arrow };