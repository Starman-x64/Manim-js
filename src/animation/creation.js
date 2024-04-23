import { VMobject } from "../mobject/types/vectorizedMobject.js";
import { Validation } from "../utils/validation.js";
import { Animation } from "./animation.js";

/**Abstract class for Animations that show the GMobject partially.
 */
class ShowPartial extends Animation {
  /**
   * @param {VMobject} mobject The `VMobject` to animate.
   * @param {{runTime: number, lagRatio: number, reverseRateFunction: boolean, name: string,  remover: boolean, introducer: boolean, suspendMobjectUpdating: boolean, rateFunc: Function, methods: {name: string, args: any[]}[]}} kwargs Keyword arguments.
   */
  constructor(mobject, kwargs={}) {
    super();
    
    if (Validation.isOfClass(this, "ShowPartial")) {
      this._init(mobject, kwargs);
    }
  }

  _init(mobject, kwargs) {
    kwargs.mobject = mobject;

    super._init(kwargs);
  }

  /**To be implemented by subclasses.
   * 
   * @param {number} alpha 
   */
  _getBounds(alpha) {
    throw new NotImplementedError("Please use Create or ShowPassingFlash");
  }
  
  /**@inheritdoc */
  interpolateSubmobject(submobject, startingSubmobject, alpha) {
    submobject.pointwiseBecomePartial(startingSubmobject, ...(this._getBounds(alpha)));
  }
}

/**Incrementally show a GMobject.
 * 
 */
class Create extends ShowPartial {
  /**
   * @param {VMobject} mobject The `VMobject` to animate.
   * @param {{runTime: number, lagRatio: number, reverseRateFunction: boolean, name: string,  remover: boolean, introducer: boolean, suspendMobjectUpdating: boolean, rateFunc: Function, methods: {name: string, args: any[]}[]}} kwargs Keyword arguments.
   */
  constructor(mobject, kwargs={ lagRatio: 0.0, introducer: true }) {
    super();
    
    if (Validation.isOfClass(this, "Create")) {
      this._init(mobject, kwargs);
    }
  }

  _init(mobject, kwargs) {
    kwargs.mobject = mobject;

    super._init(mobject, kwargs);
  }

  /**_getBounds
   * 
   * @param {number} alpha 
   * @returns {[start: 0, end: alpha]}
   */
  _getBounds(alpha) {
    return [0, alpha];
  }
}

/**Like `Create`, but in reverse.
 * 
 */
class Uncreate extends Create {
  /**
   * @param {VMobject} mobject The `VMobject` to animate.
   * @param {{runTime: number, lagRatio: number, reverseRateFunction: boolean, name: string,  remover: boolean, introducer: boolean, suspendMobjectUpdating: boolean, rateFunc: Function, methods: {name: string, args: any[]}[]}} kwargs Keyword arguments.
   */
  constructor(mobject, kwargs={ reverseRateFunction: true, remover: true, introducer: false }) {
    super();
    
    if (Validation.isOfClass(this, "uncreate")) {
      this._init(mobject, kwargs);
    }
  }

  _init(mobject, kwargs) {
    kwargs.mobject = mobject;

    super._init(mobject, kwargs);
  }
}

export { ShowPartial, Create, Uncreate };