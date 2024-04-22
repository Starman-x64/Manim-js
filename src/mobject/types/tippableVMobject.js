import { VMobject } from "./vectorizedMobject.js";
import { defineUndef } from "../../utils/validation.js";
import { DEFAULT_ARROW_TIP_LENGTH } from "../../constants.js";
import { OUT, PI } from "../../math.js";
import { ArrowTip, ArrowTriangleFilledTip, ArrowTriangleTip } from "../geometry/tips/tip.js";
import { SVGDrawer } from "../../renderer/renderer2d.js";
import { Point3D } from "../../point3d.js";

/**
 * VMobjects which can have "tips" (e.g., arrow heads) on its path's endpoints.
 */
class TippableVMobject extends VMobject {
  constructor(kwargs) {
    super(kwargs);

    this.tipLength = defineUndef(kwargs.tipLength, DEFAULT_ARROW_TIP_LENGTH);
    this.normalVector = defineUndef(kwargs.normalVector, OUT);
    this.tipStyle = defineUndef(kwargs.tipStyle, {});
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
      this.createTip(tipShape, tipLength, tipWidth, atStart)
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
      anchor = this.getStart();
      handle = points[1]; // even if the curve is linear, treating the curve's endpoint as a handle is okay.
    }
    else {
      /** @type {Ndarray[]} */
      let points = this.getNthCurvePoints(0);
      anchor = this.getEnd();
      handle = points[1]; // even if the curve is linear, treating the curve's endpoint as a handle is okay.
    }
    
    let vec = nj.subtract(handle, anchor)
    let angle = Math.atan2(vec.get(0, 1), vec.get(0, 0));
    tip.rotate(angle - PI - tip.tipAngle());

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


  getStartAndEnd() {
    return [this.getStart(), this.getEnd()];
  }

  getStart() {
    return this.getPoint(0);
  }

  getEnd() {
    return this.getPoint(this.points.shape[0]);
  }

  getLength() {
    let [start, end] = this.getStartAndEnd();
    let difference = nj.sub(end, start);
    return nj.sqrt(nj.dot(difference, difference.T)).toList()[0];
  }
}



export { TippableVMobject };