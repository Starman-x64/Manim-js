import { Mobject } from "../mobject/mobject.js";
import { Scene } from "../scene/scene.js";
import { Validation, defineUndef } from "../utils/validation.js";
import { Animation } from "./animation.js";


  /**
   * @param {Mobject} mobject The `Mobject` to be transformed. It will be mutated to become the `targetMobject`.
   * @param {Mobject} targetMobject The target of the transformation.
   * @param {{}} kwargs
   */
const TransformFactory = (mobject, targetMobject, kwargs={}) => {
  kwargs.pathFunc = defineUndef(kwargs.pathFunc, (a, b, t) => nj.add(nj.multiply(b, t), nj.multiply(a, 1 - t)));
  return new _Transform(mobject, targetMobject, kwargs);
};
/**
 * Animate the shifting of a `Mobject`.
 * @param {Mobject} mobject The `Mobject` to be transformed. It will be mutated to become the `targetMobject`.
 * @param {Mobject} targetMobject The target of the transformation.
 * @param {{}} kwargs
 */
const ShiftFactory = (mobject, shiftVector, kwargs) => {
  let targetMobject = mobject.copy();
  targetMobject.shift(shiftVector);
  return TransformFactory(mobject, targetMobject, kwargs);
};
/**
 * Animate the scaling of a `Mobject`.
 * @param {Mobject} mobject The `Mobject` to be transformed. It will be mutated to become the `targetMobject`.
 * @param {Mobject} targetMobject The target of the transformation.
 * @param {{}} kwargs
 */
const ScaleFactory = (mobject, scaleFactor, kwargs) => {
  let targetMobject = mobject.copy();
  targetMobject.scale(scaleFactor, kwargs);
  return TransformFactory(mobject, targetMobject, kwargs);
};

/**
 * A `Transform` transforms a `Mobject` into a target `Mobject`.
 */
class _Transform extends Animation {
  /**
   * @param {Mobject} mobject The `Mobject` to be transformed. It will be mutated to become the `targetMobject`.
   * @param {Mobject} targetMobject The target of the transformation.
   * @param {{}} kwargs
   */
  constructor(mobject, targetMobject, kwargs={}) {
    super();

    if (Validation.isOfClass(this, "_Transform")) {
      this._init(mobject, targetMobject, kwargs);
    }
  }

  _init(mobject, targetMobject, kwargs) {
    /** @type {Mobject} */
    this.targetMobject = defineUndef(targetMobject, new Mobject());
    //this.pathFunc = defineUndef(kwargs.pathFunc, (a, b, t) => nj.add(nj.multiply(b, t), nj.multiply(a, 1 - t)));
    
    super._init(mobject, targetMobject, kwargs);
    
    //this.mobject.interpolate(this.targetMobject, this.targetMobject, 1);
  }

  begin(scene) {
    this.targetMobject = this.createTarget();
    this.targetCopy = this.targetMobject.copy();

    super.begin(scene);
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

  getAllFamiliesZipped() {
    let mobjects = [
      this.mobject,
      this.startingMobject,
      this.targetCopy
    ]
    let allMobjects = mobjects.map(mob => mob.familyMembersWithPoints());
    return allMobjects[0].map((mob, i) => [mob, allMobjects[1][i], allMobjects[2][i]]);
  }

  /**
   * 
   * @param {Mobject} submobject 
   * @param {Mobject} startingSubmobject 
   * @param {Mobject} targetCopy 
   * @param {number} alpha 
   */
  interpolateSubmobject(submobject, startingSubmobject, targetCopy, alpha) {
    // console.log(startingSubmobject);
    // console.log(targetCopy);
    submobject.interpolate(startingSubmobject, targetCopy, alpha);
    return this;
  }
}

export { _Transform, TransformFactory as Transform, ShiftFactory as Shift, ScaleFactory as Scale };