import { Mobject } from "../mobject/mobject.js";
import { Scene } from "../scene/scene.js";
import { Validation, defineUndef } from "../utils/validation.js";
import { Animation } from "./animation.js";


const Transform = (mobject, targetMobject, kwargs) => {
  kwargs.pathFunc = defineUndef(kwargs.pathFunc, (a, b, t) => nj.add(nj.multiply(b, t), nj.multiply(a, 1 - t)));
  return new _Transform(mobject, targetMobject, kwargs);
};

/**
 * A `Transform` transforms a `Mobject` into a target `Mobject`.
 */
class _Transform extends Animation {
  /**
   * @param {Mobject} mobject The `Mobject` to be transformed. It will be mutated to become the `targetMobject`.
   * @param {Mobject} targetMobject The target of the transformation.
   */
  constructor(mobject, propertyInterpolationFunctions, kwargs) {
    super();

    if (Validation.isOfClass(this, "_Transform")) {
      this._init(mobject, propertyInterpolationFunctions, kwargs);
    }
  }

  _init(mobject, propertyInterpolationFunctions, kwargs) {
    /** @type {Mobject} */
    //this.targetMobject = defineUndef(targetMobject, new Mobject());
    //this.pathFunc = defineUndef(kwargs.pathFunc, (a, b, t) => nj.add(nj.multiply(b, t), nj.multiply(a, 1 - t)));
    
    super._init(mobject, propertyInterpolationFunctions, kwargs)
  }

  // begin() {
  //   //this.targetMobject = this.createTarget();
  //   //this.targetCopy = this.targetMobject.copy();

  //   super.begin();
  // }

  createTarget() {
    // Has no meaningful effect here, but may be useful in subclases.
    //return this.targetMobject;
  }

  /**
   * 
   * @param {Scene} scene 
   */
  cleanUpFromScene(scene) {
    super.cleanUpFromScene(scene);
    //if (this.replaceMobjectWithTargetInScene) {
    //  scene.replace(this.mobject, this.targetMobject);
    //}
  }

  /**
   * 
   * @param {Mobject} submobject 
   * @param {Mobject} startingSubmobject 
   * @param {Mobject} targetCopy 
   * @param {number} alpha 
   */
  interpolateSubmobject(submobject, startingSubmobject, alpha) {
    for (let [property, interpolationFunc] of Object.entries(this.propertyInterpolationFunctions)) {
      let funcName = "set"+property[0].toUpperCase()+property.substring(1);
      submobject[funcName](interpolationFunc(alpha));
      console.log(property, "=", interpolationFunc(alpha));
      console.log("alpha =", alpha);
      console.log("real value=", submobject[property]);
    }
  }
}

export { _Transform as Transform };