import { ValueError } from "../error/errorClasses.js";
import { ORIGIN } from "../math.js";
import { Mobject } from "../mobject/mobject.js";
import { Validation, defineUndef } from "../utils/validation.js";
import { _Transform } from "./transform.js";

/**
 * @param {Mobject} mobject 
 * @param {{shiftVector: Ndarray, scaleFactor: number}} kwargs 
 */
const _Fade = (mobject, kwargs) => {
  return new __Fade(mobject, kwargs);
}
/**
 * @param {Mobject} mobject 
 * @param {{shiftVector: Ndarray, scaleFactor: number}} kwargs 
 */
const FadeIn = (mobject, kwargs) => {
  return new _FadeIn(mobject, kwargs);
}
/**
 * @param {Mobject} mobject 
 * @param {{shiftVector: Ndarray, scaleFactor: number}} kwargs 
 */
const FadeOut = (mobject, kwargs) => {
  return new _FadeOut(mobject, kwargs);
}


class __Fade extends _Transform {
  /**
   * @param {Mobject} mobject 
   * @param {{shiftVector: Ndarray, scaleFactor: number}} kwargs 
   */
  constructor(mobject, kwargs={}) {
    super();
    
    if (Validation.isOfClass(this, "__Fade")) {
      this._init(mobject, kwargs);
    }
  }

  /**
   * @param {Mobject} mobject 
   * @param {{shiftVector: Ndarray, scaleFactor: number}} kwargs 
   */
  _init(mobject, kwargs) {
    if (Validation.isUndefined(mobject)) {
      throw new ValueError("At least one Mobject must be passed into `_Fade` animation!");
    }
    this.shiftVector = defineUndef(kwargs.shiftVector, ORIGIN.clone());
    this.scaleFactor = defineUndef(kwargs.scaleFactor, 1);
    this.fadeIn = defineUndef(kwargs.fadeIn, false);
    
    let targetMobject = mobject.copy();
    targetMobject.scale(this.scaleFactor).shift(this.shiftVector);
    
    let targetOpacity = this.fadeIn ? targetMobject.opacity * 1 : 0;
    console.log(targetMobject.opacity, mobject.opacity);
    targetMobject.opacity = targetOpacity;
    mobject.opacity = this.fadeIn ? 0 : mobject.opacity * 1;
    console.log(targetMobject.opacity, mobject.opacity);
     
    super._init(mobject, targetMobject, kwargs);
  }

  createStartingMobject() {
    this.mobject.fade(this.fadeIn ? 0 : this.mobject.opacity);
    return this.mobject.copy();
  }
}

class _FadeIn extends __Fade {
  /**
   * @param {Mobject} mobject 
   * @param {{shiftVector: Ndarray, scaleFactor: number}} kwargs 
   */
  constructor(mobject, kwargs={}) {
    super();
    
    if (Validation.isOfClass(this, "_FadeIn")) {
      this._init(mobject, kwargs);
    }
  }

  _init(mobject, kwargs) {
    kwargs.fadeIn = true;
    kwargs.introducer = true;
    super._init(mobject, kwargs);
  }
}

class _FadeOut extends __Fade {
  /**
   * @param {Mobject} mobject 
   * @param {{shiftVector: Ndarray, scaleFactor: number}} kwargs 
   */
  constructor(mobject, kwargs={}) {
    super();
    
    if (Validation.isOfClass(this, "_FadeOut")) {
      this._init(mobject, kwargs);
    }
  }

  _init(mobject, kwargs) {
    kwargs.fadeIn = false;
    kwargs.remover = true;
    super._init(mobject, kwargs);
  }
}


export { FadeIn, FadeOut };