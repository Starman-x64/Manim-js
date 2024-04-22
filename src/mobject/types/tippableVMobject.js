import { VMobject } from "./vectorizedMobject.js";
import { Validation, defineUndef } from "../../utils/validation.js";
import { DEFAULT_ARROW_TIP_LENGTH } from "../../constants.js";
import { DEGREES, OUT, PI } from "../../math.js";
import { ArrowTip, ArrowTriangleFilledTip, ArrowTriangleTip } from "../geometry/tips/tip.js";
import { SVGDrawer } from "../../renderer/renderer2d.js";
import { Point3D } from "../../point3d.js";
import { SpaceOps } from "../../utils/spaceOps.js";

/**
 * VMobjects which can have "tips" (e.g., arrow heads) on its path's endpoints.
 */
class TippableVMobject extends VMobject {
  constructor(kwargs) {
    super(kwargs);

    if (Validation.isOfClass(this, "TippableVMobject")) {
      this._init(kwargs);
    }
  }

  _init(kwargs) {
    this.tipLength = defineUndef(kwargs.tipLength, DEFAULT_ARROW_TIP_LENGTH);
    this.normalVector = defineUndef(kwargs.normalVector, OUT);
    this.tipStyle = defineUndef(kwargs.tipStyle, {});
    
    super._init(kwargs);
  }

  /**
   * Adds a tip to the `TipableVMobject` instance, recognising
   * that the endpoints might need to be switched if it's
   * a "starting tip" or not.
   * @param {{}}kwargs kwargs
   * @returns {ArrowTip}
   */
  addTip(kwargs) {
    /** @type {typeof ArrowTip | null} */
    let tipShape = defineUndef(kwargs.tipShape, null);
    /** @type {number | null} */
    let tipLength = defineUndef(kwargs.tipLength, null);
    /** @type {number | null} */
    let tipWidth = defineUndef(kwargs.tipWidth, null);
    /** @type {boolean} */
    let atStart = defineUndef(kwargs.atStart, false);
    /** @type {ArrowTip | null} */
    let tip = defineUndef(kwargs.tip, null);

    if (tip === null) {
      tip = this.createTip(tipShape, tipLength, tipWidth, atStart)
    }
    else {
      this.positionTip(tip, atStart);
    }
    this.resetEndpointsBasedOnTip(tip, atStart);
    this.assignTipAttribute(tip, atStart);
    this.add(tip);
    return this;
  }

  /**
   * Stylises the tip, positions it spatially, and returns
   * the newly instantiated tip to the caller.
   * @param {typeof ArrowTip} tipShape
   * @param {number} tipLength
   * @param {number} tipWidth
   * @param {boolean} atStart
   * @returns {ArrowTip}
   */
  createTip(tipShape, tipLength, tipWidth, atStart) {
    let tip = this.getUnpositionedTip(tipShape, tipLength, tipWidth);
    this.positionTip(tip, atStart);
    return tip;
  }

  /**
   * Returns a tip that has been stylistically configured,
   * but has not yet been given a position in space.
   * @param {typeof ArrowTip | null} tipShape 
   * @param {number} tipLength 
   * @param {number} tipWidth 
   * @returns {ArrowTip}
   */
  getUnpositionedTip(tipShape, tipLength, tipWidth) {
    let style = {};

    if (tipShape === null) {
      tipShape = ArrowTriangleFilledTip;
    }

    if (tipShape == ArrowTriangleFilledTip) {
      if (tipWidth === null) {
        tipWidth = DEFAULT_ARROW_TIP_LENGTH;
      }
      style.width = tipWidth;
    }
    if (tipLength === null) {
      tipLength = DEFAULT_ARROW_TIP_LENGTH;
    }

    style.fillColor = this.fillColor;
    style.strokeColor = this.strokeColor;

    let tip = new tipShape({ length: tipLength, fillColor: this.fillColor, strokeColor: this.strokeColor });
    return tip;
  }

  /**
   * 
   * @param {ArrowTip} tip 
   * @param {boolean} atStart 
   * @returns {this}
   */
  positionTip(tip, atStart) {
    /** @type {Ndarray} */
    let anchor, handle;
    if (atStart) {
      /** @type {Ndarray[]} */
      let points = this.getNthCurvePoints(0);
      console.log(points);
      anchor = points[0];
      handle = points[1]; // even if the curve is linear, treating the curve's endpoint as a handle is okay.
    }
    else {
      /** @type {Ndarray[]} */
      let points = this.getNthCurvePoints(this.getNumCurves() - 1);
      anchor = points[points.length - 1];
      console.log(points);
      handle = points[points.length - 2]; // even if the curve is linear, treating the curve's endpoint as a handle is okay.
    }
    
    let vec = nj.subtract(handle, anchor);
    console.log(handle.toString());
    console.log(anchor.toString());
    console.log(vec.toString());
    let angles = SpaceOps.cartesianToSpherical(vec);
    console.log(angles[0], angles[1] * DEGREES, angles[2] * DEGREES);
    console.log("tipangle", tip.tipAngle() * DEGREES);
    console.log("base\n", tip.base().toString());
    console.log("tippoint\n", tip.tipPoint().toString());
    let a = angles[1] + PI/2 - tip.tipAngle();
    console.log("a", a * DEGREES);
    tip.rotate(a);

    if (!("_initPositioningAxis" in this)) {
      let axis = Point3D(Math.sin(angles[1]), Math.cos(angles[1]), 0);
      console.log(axis.toString());
      
      //tip.rotate(-angles[2] + PI/2, { axis: axis });

      this._initPositioningAxis = axis;
    }

    //let axis = Point3D(Math.sin(angle), -Matah.cos(angle), 0); // obtains the perpendicular of the tip
    //tip.rotate()

    tip.shift(nj.subtract(anchor, tip.tipPoint()));
    return tip;
  }
  
  /**
   * 
   * @param {ArrowTip} tip 
   * @param {boolean} atStart 
   * @returns {this}
   */
  resetEndpointsBasedOnTip(tip, atStart) {
    if (this.getLength() == 0) {
      // Zero length, put_start_and_end_on wouldn't work.
      return this;
    }

    if (atStart) {
      this.putStartAndEndOn(tip.base(), this.getEnd());
    }
    else {
      this.putStartAndEndOn(this.getStart(), tip.base());
    }
    return this;
  }

  /**
   * 
   * @param {ArrowTip} tip 
   * @param {boolean} atStart 
   * @returns {this}
   */
  assignTipAttribute(tip, atStart) {
    if (atStart) {
      this.startTip = tip;
    }
    else {
      this.tip = tip;
    }
    return this;
  }



  getLength() {
    let [start, end] = this.getStartAndEnd();
    let difference = nj.subtract(end, start);
    return nj.sqrt(nj.dot(difference, difference.T)).selection.data[0];
  }
}



export { TippableVMobject };