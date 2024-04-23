import { Mobject } from "../mobject/mobject.js";
import { Scene } from "../scene/scene.js";
import { Validation, defineUndef } from "../utils/validation.js";
import { Animation } from "./animation.js";

/**
 * A `Transform` transforms a `Mobject` into a target `Mobject`.
 */
class Transform extends Animation {
  /**
   * @param {Mobject} mobject The `Mobject` to be transformed. It will be mutated to become the `targetMobject`.
   * @param {Mobject} targetMobject The target of the transformation.
   */
  constructor(mobject, targetMobject, kwargs) {
    if (Validation.isOfClass("Transform")) {
      this._init(mobject, targetMobject, kwargs);
    }
  }

  _init(mobject, targetMobject, kwargs) {
    /** @type {Mobject} */
    this.targetMobject = defineUndef(targetMobject, new Mobject());
    this.pathFunc = defineUndef(kwargs.pathFunc, (a, b, t) => nj.add(nj.multiply(b, t), nj.multiply(a, 1 - t)));
    
    super._init(mobject, kwargs)
  }

  begin() {
    this.targetMobject = this.createTarget();
    this.targetCopy = this.targetMobject.copy();

    super.begin();
  }

  createTarget() {
    // Has no meaningful effect here, but may be useful in subclases.
    return this.targetMobject;
  }

  /**
   * 
   * @param {Scene} scene 
   */
  cleanUpFromScene(scene) {
    super.cleanUpFromScene(scene);
    if (this.replaceMobjectWithTargetInScene) {
      scene.replace(this.mobject, this.targetMobject);
    }
  }

  /**
   * 
   * @param {Mobject} submobject 
   * @param {Mobject} startingSubmobject 
   * @param {Mobject} targetCopy 
   * @param {number} alpha 
   */
  interpolateSubmobject(submobject, startingSubmobject, targetCopy, alpha) {
    submobject.interpolate(startingSubmobject, targetCopy, alpha,  this.pathFunc);
  }
}

export { Transform };