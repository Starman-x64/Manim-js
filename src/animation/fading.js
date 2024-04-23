import { ValueError } from "../error/errorClasses.js";
import { ORIGIN } from "../math.js";
import { Mobject } from "../mobject/mobject.js";
import { Validation, defineUndef } from "../utils/validation.js";
import { Transform } from "./transform.js";

const _Fade = (mobject, kwargs) => {
  return new __Fade(mobject, kwargs);
}
const FadeIn = (mobject, kwargs) => {
  return new _FadeIn(mobject, kwargs);
}


class __Fade extends Transform {
  /**
   * @param {Mobject} mobject 
   * @param {{}} kwargs 
   */
  constructor(mobject, kwargs={}) {
    super();
    
    if (Validation.isOfClass(this, "__Fade")) {
      this._init(mobject, kwargs);
    }
  }

  /**
   * @param {Mobject} mobject 
   * @param {{}} kwargs 
   */
  _init(mobject, kwargs) {
    if (Validation.isUndefined(mobject)) {
      throw new ValueError("At least one Mobject must be passed into `_Fade` animation!");
    }

    this.shiftVector = defineUndef(kwargs.shiftVector, ORIGIN);
    this.scaleFactor = defineUndef(kwargs.scaleFactor, 1);
    kwargs.fadeIn = defineUndef(kwargs.fadeIn, false);
    
    
    let fadeInterpolationFunc = this.createOpacityInterpolationFunc(mobject, kwargs.fadeIn);

    super._init(mobject, { opacity: fadeInterpolationFunc }, kwargs);
  }

  createOpacityInterpolationFunc(mobject, fadeIn) {
    let start = fadeIn ? 0 : mobject.opacity;
    let end = fadeIn ? mobject.opacity : 0;

    return (t) => start*(1-t) + end * t;
  }
}

class _FadeIn extends __Fade {
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


export { FadeIn };