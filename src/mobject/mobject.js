import { Validation, defineUndef } from "../utils/validation.js";
import { Point3D } from "../point3d.js";
import { ORIGIN, OUT } from "../math.js";
import { ManimColor } from "../color/manimColor.js";
import { Animation } from "../animation/animation.js";
import { NotImplementedError, ValueError } from "../error/errorClasses.js";

/**Mathematical Object: base class for objects that can be displayed on screen.
 * 
 * @param {Mobject[]} submobjects The contained objects.
 * @param {nj.NdArray} points The points of the objects.
 */
class Mobject {
  /**
   * @param {{name: string, dim: number, target: Mobject|null, zIndex: number}} kwargs 
   */
  constructor(kwargs={}) {
    if (Validation.isOfClass(this, "Mobject")) {
      this._init(kwargs);
    }
  }

  _init(kwargs) {
    /**
     * The name of the Mobject.
     * @type {string}
     */
    this.name = defineUndef(kwargs.name, this.constructor.name);
    this.opacity = defineUndef(this.opacity, defineUndef(kwargs.opacity, 1));
    //this.dim = defineUndef(kwargs.dim, 3);
    //this.target = defineUndef(kwargs.target, null);
    //this.zIndex = defineUndef(kwargs.zIndex, 0);
    //this.pointHash = null;
    this.submobjects = [];
    this.updaters = [];
    /**
     * Whether or not this mobject should be updated each frame.
     * @type {boolean}
     */
    this.updatingSuspended = false;
    //self.color = ManimColor.parse(color)

    this.initMobject();
  }

  // animationOverrideFor() {}
  // addIntrinsicAnimationOverrides() {}
  // addAnimationOverride() {}
  // setDefault() {}
  // animate() {}

  animate(kwargs) {
    let animationBuilder = new _AnimationBuilder(this, kwargs);
    this.animationBuilder = animationBuilder;
    this.animationBuilder.targetMobject.animationBuilder = animationBuilder;
    console.log(animationBuilder);
    return animationBuilder.targetMobject;
  }

  buildAnimation() {
    if (Validation.isUndefined(this.animationBuilder)) {
      throw new ValueError("Mobject has no animation to build!");
    }
    console.log(this.animationBuilder);
    let animation = this.animationBuilder.buildAnimation();
    this.animationBuilder = undefined;
    return animation;
  }
  
  /**
   * Runs `resetPoints()`, `generatePoints()`, and `initColors()`.  
   * This method is to be called by children of the `Mobject` class.  
   * In the Python Manim implementation, the three functions were executed
   * by the `Mobject` class only, and subclasses called `super()` after their
   * own `__init__()`function had been run. Because in JS `this` cannot be
   * accessed until `super()` has been run, running the three functions in 
   * `Mobject` meant that any implementations of these functions which included
   * attributes specific to a child class would often be erroneous.
  */
  initMobject() {
    this.resetPoints();
    this.generatePoints();
    this.initColors();
  }

  /**
   * Sets `points` to be an empty array.
   */
  resetPoints() {
    this.points = [];
  }
  
  /**
   * Initializes the colors.
   * 
   * Gets called upon creation. This is an empty method that can be implemented by
   * subclasses.
   */
  initColors() {
    
  }
  
  /**
   * Initializes `points` and therefore the shape.
   * 
   * Gets called upon creation. This is an empty method that can be implemented by
   * subclasses.
   */
  generatePoints() {
    
  }

  /**
   * Add mobjects as submobjects. The mobjects are added to `this.submobjects`.
   * 
   * A mobject cannot contain itself, and it cannot contain a submobject
   * more than once. If the parent mobject is displayed, the newly-added
   * submobjects will also be displayed (i.e. they are automatically added
   * to the parent Scene).
   * 
   * @param {...Mobject} mobjects The mobjects to add.
   * @returns {this}
   */
  add(...mobjects) {
    // Error checking
    if (mobjects.includes(this)) {
      throw new ValueError("Mobject cannot contain self");
    }
    mobjects.forEach((mobject, i) => {
      if (!(mobject instanceof Mobject)) {
        throw new TypeError("All submobjects must be of type Mobject");
      }
    });
    let existingChildren = mobjects.filter(mobject => this.submobjects.includes(mobject));
    if (existingChildren.length > 0) {
      console.warn(`Some Mobjects are already children of their parent, adding again is not possible. These cases are ignored.`);
    }

    /*
     * Creates an `Array` excluding mobjects that are already children.
     * `Array` is converted into a `Set` which will remove duplicates, before being turned back into an `Array`.
     */ 
    let uniqueMobjects = Array.from(new Set(mobjects.filter(mobject => !existingChildren.includes(mobject))));
    // console.log(uniqueMobjects);
    if (uniqueMobjects.length != mobjects.length - existingChildren.length) {
      console.warn("Attempted adding some Mobject as a child more than once, this is not possible. Repetitions are ignored."); 
    }
    
    // Append mobjects to `this.submobjects`
    this.submobjects = this.submobjects.concat(uniqueMobjects);
    return this;
  }

  /**Inserts a mobject at a specific position into `this.mobjects`.
   * 
   * Effectively just calls `this.submobjects.splice(index, 0, mobject)`.
   * 
   * Highly adapted from `Mobject.add`.
   * 
   * @param {number} index The index at which to insert the given mobject.
   * @param {Mobject} mobject The mobject to insert.
   * @returns {void}
   */
  insert(index, mobject) {
    // Error checking
    if (mobject === this) {
      throw new Error("Mobject cannot contain self");
    }
    if (!(mobject instanceof Mobject)) {
      throw new TypeError("All submobjects must be of type Mobject");
    }
    if (this.submobjects.includes(mobject)) {
      console.warn(`Mobject is already a child of parent, adding again is not possible. This is ignored.`);
      return;
    }
    
    // Insert at desired index
    this.submobjects.splice(index, 0, mobject);
    return this;
  }

  /**Add all passed mobjects to the back of the submobjects.
   * 
   * If `submobjects` already contains the given mobjects, they just get moved to the back instead.
   * 
   * This is done by adding (or moving) to the start of `this.submobjects`. Submomjects at the head
   * of the list are rendered first, which places the corresponding mobjects behind the subsequent
   * list members. 
   * 
   * @param  {...Mobject} mobjects The mobjects to add.
   * @returns {this}
   */
  addToBack(...mobjects) {
    // Error checking
    if (mobjects.includes(this)) {
      throw new Error("Mobject cannot contain self");
    }
    mobjects.forEach((mobject, i) => {
      if (!(mobject instanceof Mobject)) {
        throw new TypeError("All submobjects must be of type Mobject");
      }
    });
    let uniqueMobjects = Array.from(new Set(mobjects));
    if (uniqueMobjects.length != mobjects.length) {
      console.warn("Attempted adding some Mobject as a child more than once, this is not possible. Repetitions are ignored."); 
    }

    // If any mobjects we want to add are already children, remove them, but then prepend them with the other mobjects.
    this.submobjects = this.submobjects.filter(mobject => !mobjects.includes(mobject));
    this.submobjects.splice(0, 0, ...uniqueMobjects);
    
    return this;
  }

  /**Removes the given mobjects from `this.submobjects` if they exist.
   * 
   * @param  {...Mobject} mobjects The mobjects to remove.
   * @returns {this}
   */
  remove(...mobjects) {
    this.submobjects = this.submobjects.filter(mobject => !mobjects.includes(mobject));
    return this;
  }

  /**Sets attributes.
   * 
   * I.e. `myMobject.set({ foo: 1 })` applies `myMobject.foo = 1`.
   * 
   * This is a convenience to be used along with `this.animate` to
   * animate setting attributes.
   * 
   * @param {object} kvp Object containing pairs of attributes and values to set.
   * @returns {this Mobject}
   */
  set(kvp) {
    for (let [key, value] of Object.entries(kvp)) {
      this[key] = value;
      this.width
    }
    return this;
  }
  
  /**
   * Gets the width (X dimension) of the mobject.
   * @returns {number}
   */
  // width() {
  // }

  /**
   * Sets the mobject's width (X dimension) to the given value.
   * @param {number} value 
   */
  width(value) {
    if (this.value !== undefined) {
      this.scaleToFitWidth(value);
      return;
    }
    return this.lengthOverDim(0);
  }
  
  /**
   * Gets the height (Y dimension) of the mobject.
   * @returns {number}
   *//**
   * Sets the mobject's height (Y dimension) to the given value.
   * @param {number} value 
   */
  // height() {
  //   return this.lengthOverDim(1);
  // }
  height(value) {
    if (this.value !== undefined) {
      this.scaleToFitHeight(value);
      return;
    }
    return this.lengthOverDim(1);
  }
  
  /**
   * Gets the depth (Z dimension) of the mobject.
   * @returns {number}
   *//**
   * Sets the mobject's depth (Z dimension) to the given value.
   * @param {number} value 
   */
  // depth() {
  //   return this.lengthOverDim(2);
  // }
  depth(value) {
    if (this.value !== undefined) {
      this.scaleToFitDepth(value);
      return;
    }
    return this.lengthOverDim(2);
  }

  lengthOverDim(dim) {
    let componentsInDim = this.points.slice([dim, dim+1]).flatten();
    return componentsInDim.max() - componentsInDim.min();
  }

  getCenter() {
    throw new NotImplementedError(`Cannot get the centre of ${this.constructor.name}!`);
  }

  /**
   * Not sure what this does...
   * @returns {["points"]}
   */
  getArrayAttrs() {
    return ["points"];
  }
  /**
   * Not sure what this does either...
   * @param {Function} func Mapping function.
   * @returns {this}
   */
  applyOverAttrArrays(func) {
    
  }
  
  setPoints(points) {
    this.points = points;
  }
  
  /**
   * Get a specific point by its index.
   * @param {number} index The index of the point to get.
   * @returns {Ndarray}
   */
  getPoint(index) {
    Validation.testNumberInRange({index}, 0, this.points.shape[0] - 1);
    return this.points.slice([index, index+1]).flatten();
  }
  

  // Displaying
  
  /**
   * 
   * @param {Camera} camera
   * @returns {image}
   */
  getImage(camera=null) {
    
  }
  
  show(camera=null) {
    
  }

  /**Saves an image of only this `Mobject` at its position to a png file.
   * 
   * @param {string} name Name of file. If omitted, uses `this.name`.
   * @returns {void}
   */
  saveImage(name=null) {
    
  } 


  /**Create and return an identical copy of the `Mobject` including all `submobjects`.
   * 
   * The copy is initially not visible in the Scene, even if the original was.
   * 
   * @returns {Mobject} The copy.
   */
  copy() {
    let copy = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    copy.points = Validation.isOfClass(this.points, "Array") ? [] : this.points.clone();
    copy.opacity = this.opacity.valueOf() * 1;
    // for (let [key, value] of Object.entries(this)) {
    //   if (key == "points") continue;
    //   try {
    //     copy[key] = structuredClone(value);
    //   }
    //   catch (error) {

    //   }
    // }
    return copy;
  }
  
  /**Dunno what this does...
   * 
   * @param {boolean | false} useDeepcopy Use deep copy
   */
  generateTarget(useDeepcopy=false) {
    
  }


  // Updating

  /**Apply all updaters.
   * 
   * Does nothing if updating is suspended.
   * 
   * @param {number} dt The parameter `dt` to pass to all the update functions. Usually this is the time in seconds since the last call of `update`.
   * @param {bool | true} recursive Whether to recursively update all submobjects.
   * @returns {this}
   */
  update(dt=0, recursive=true) {
    if (this.updatingSuspended) {
      return this;
    }
    
    this.updaters.forEach(updater => {
      // An updater function can only have the parameter `dt` or no parameter at all.
      if (updater.length > 0) {
        updater.call(this, dt);
      }
      else {
        updater.call(this);
      }
    });
    
    if (recursive) {
      this.submobjects.forEach(submobject => {
        submobject.update(dt, recursive);
      });
    }
    return this;
  }

  /**Return all updaters using the `dt` parameter.
   * 
   * The updaters use this parameter as the input for difference in time.
   * 
   * @returns {TimeBasedUpdater[]}
   */
  getTimeBasedUpdaters() {
    return self.updaters.filter(updater => updater.length > 0);
  }

  /**Test if `this` has a time based updater.
   * 
   * @returns {boolean} `true` if at least one updater uses the `dt` parameter, `false` otherwise.
   */
  hasTimeBasedUpdater() {
    this.updaters.forEach(updater => {
      if (updater.length > 0) {
        return true;
      }
    });
    return false;
  }

  /**Return all updaters.
   * 
   * @returns {Updater[]}
   */
  getUpdaters() {
    return this.updaters;
  }

  /**What does this do? Who knows!
   * 
   * @returns {Updater[]}
   */
  getFamilyUpdaters() {

  }

  /**Add an update function to this mobject.
   * 
   * Update functions, or updaters in short, are functions that are applied to the Mobject in every frame.
   * 
   * @param {Updater} updateFunction The update function to be added.
   * @param {number} index The index at which the updater should be added in `this.updaters`. In the case `index` is `null` the updater will be added at the end.
   * @param {boolean} callUpdater Whether or not to call the updater initially. If `true`, the updater will be called using `dt=0`.
   * @returns {this}
   */
  addUpdater(updateFunction, index=null, callUpdater=false) {
    if (!index) {
      this.updaters.push(updateFunction);
    }
    else {
      this.updaters.splice(index, 0, updateFunction);
    }
    
    if (callUpdater) {
      if (updater.length > 0) {
        updater.call(this, dt);
      }
      else {
        updater.call(this);
      }
    }

    return this;
  }
  
  /**Remove an updater.
   * 
   * If the same updater is applied multiple times, every instance gets removed.
   * 
   * @param {Updater} updateFunction The update function to be removed.
   * @returns {this}
   */
  removeUpdater(updateFunction) {
    while(this.updaters.includes(updateFunction)) {
      this.updaters.splice(this.updaters.indexOf(updateFunction), 1);
    }
    
    return this;
  }

  /**Remove every updater.
   * 
   * @param {boolean | true} recursive Whether to recursively call `clearUpdaters` on all submobjects.
   * @returns {this}
   */
  clearUpdaters(recursive=true) {
    this.updaters = [];
    
    if (recursive) {
      this.submobjects.forEach(submobject => {
        submobject.clearUpdaters();
      });
    }
    
    return this;
  }

  matchUpdaters() {}
  
  /**Disable updating from updaters and animations.
   * 
   * @param {boolean | true} recursive Whether to recursively suspend updating on all submobjects.
   * @returns {this}
   */
  suspendUpdating(recursive=true) {
    self.updatingSuspended = true;
    
    if (recursive) {
      this.submobjects.forEach(submobject => {
        submobject.suspendUpdating();
      });
    }
    return this
  }

  /**Enable updating from updaters and animations.
   * 
   * @param {boolean | true} recursive Whether to recursively enable updating on all submobjects.
   * @returns {this}
   */
  resumeUpdating(recursive=true) {
    self.updatingSuspended = false;
    
    if (recursive) {
      this.submobjects.forEach(submobject => {
        submobject.resumeUpdating();
      });
    }
    
    this.update(0, recursive);
    return this;
  }



  // Transforming Operations
  /**Apply a function to `this` and every submobject with points recursively.
   * 
   * @param {Function} func The function to apply to each mobject. `func` gets passed the respective (sub)mobject as parameter.
   * @returns {this}
   */
  applyToFamily(func) {
    this.familyMembersWithPoints().forEach(submobject => func.apply(submobject, func.arguments));
    return this;
  }
  
  /**Shift by the given vectors.
   * 
   * @param  {...number[]} vectors Vectors to shift by. If multiple vectors are given, they are added together.
   * @returns {this}
   */
  shift(...vectors) {
    let totalVector = vectors.reduce((acc, vector) => nj.add(acc, vector), Point3D(0, 0, 0));
    // console.log(this.constructor.name, this.familyMembersWithPoints());
    this.familyMembersWithPoints().forEach(mobject => {
      totalVector.flatten().selection.data.forEach((coord, index) => {
        for(let i = 0; i < mobject.points.shape[0]; i++) {
          mobject.points.set(i, index, mobject.points.get(i, index) + coord);
        }
      });
    });

    return this;
  }
  
  /**Scale the size by a factor.
   * 
   * Default behavior is to scale about the center of the mobject.
   * 
   * @param  {number} scaleFactor The scaling factor `α`. If `0 < |α| < 1`, the mobject will shrink, and for :math:`|α| > 1` it will grow. Furthermore, if :math:`α < 0`, the mobject is also flipped.
   * @param  {object} kwargs Additional keyword arguments passed to `applyPointsFunctionAboutPoint()`.
   * @returns {this}
   */
  scale(scaleFactor, kwargs) {
    //let transformationMatrix = vectors.reduce((acc, vector) => nj.add(acc, vector), nj.zeros(3));
    kwargs = defineUndef(kwargs, { center: this.getCenter() });
    console.log(kwargs);
    this.applyPointsFunctionAboutPoint(points => nj.multiply(points, scaleFactor), kwargs.center);

    return this;
  }

  applyPointsFunctionAboutPoint(func, point) {
    point = defineUndef(point, ORIGIN);
    console.log(point.toString());
    let subtractPoint = nj.array([
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [-point.get(0,0), -point.get(1,0), -point.get(2,0), 1],
    ]);
    let addPoint = nj.array([
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [point.get(0,0), point.get(1,0), point.get(2,0), 1],
    ]);
    console.log(point.toString());
    console.log(subtractPoint.toString());
    console.log(addPoint.toString());
    this.familyMembersWithPoints().forEach(mobject => {
      let ones = nj.ones(mobject.points.shape[0]).reshape(-1,1);
      let newPoints = nj.concatenate(mobject.points, ones);
      let originalShape = [...(mobject.points.shape)];
      newPoints = nj.dot(newPoints, subtractPoint);
      newPoints = func(newPoints.slice(null,[-1]));
      newPoints = nj.concatenate(newPoints, ones);
      newPoints = nj.dot(newPoints, addPoint);
      mobject.points = newPoints.slice(null,[-1]);
    });
    
    return this;
  }

  rotate(angle, kwargs) {
    // p' = q*pq
    kwargs = defineUndef(kwargs, { axis: OUT });
    let axis = defineUndef(kwargs.axis, OUT);
    let sinHalfAngle = Math.sin(angle/2);
    let cosHalfAngle = Math.cos(angle/2);
    
    let rotationmatrix;
    
    if (axis == OUT) {
      let sinAngle = Math.sin(angle);
      let cosAngle = Math.cos(angle);
      rotationmatrix = nj.array([
        [cosAngle, -sinAngle, 0],
        [sinAngle,  cosAngle, 0],
        [       0,         0, 1]
      ]);
    }
    else {
      let q0 = cosHalfAngle;
      let q1 =sinHalfAngle * axis.get(0,0);
      let q2 =sinHalfAngle * axis.get(0,1);
      let q3 =sinHalfAngle * axis.get(0,2);
  
      rotationmatrix = nj.array([
        [1-2*q2*q2-q3*q3, 2*q1*q2-2*q0*q3, 2*q1*q3+2*q0*q2],
        [2*q1*q2+2*q0*q3, 1-2*q1*q1-q3*q3, 2*q2*q3-2*q0*q1],
        [2*q1*q3-2*q0*q2, 2*q2*q3+2*q0*q1, 1-2*q1*q1-q2*q2]
      ]);
    }
    
    this.familyMembersWithPoints().forEach(mobject => {
      mobject.transformByMatrix(rotationmatrix, kwargs);
    });
    
    return this;
  }

  /**
   * Transform the points of the mobject by applying a matrix.
   * 
   * Default behavior is to scale about the center of the mobject.
   * 
   * @param  {number} matrix The 3x3 transformation matrix.
   * @param  {object} kwargs Additional keyword arguments passed to `applyPointsFunctionAboutPoint()`.
   * @returns {this}
   */
  transformByMatrix(matrix, kwargs) {
    //let transformationMatrix = vectors.reduce((acc, vector) => nj.add(acc, vector), nj.zeros(3)); 
    this.familyMembersWithPoints().forEach(mobject => {
      // Matrix is postmultiplied because points are row-major.
      mobject.points = nj.dot(mobject.points, matrix);
    });

    return this;
  }
  
  /**
   * Turns this `Mobject` into an interpolation between `mobject1` and `mobject2`.
   * @param {Mobject} mobject1 
   * @param {Mobject} mobject2 
   * @param {number} alpha 
   * @param {(a: NdArray, b: NdArray, t: number) => Ndarray} pathFunc
   * @returns {this}
   */
  interpolate(mobject1, mobject2, alpha, pathFunc) {
    this.interpolateColor(mobject1, mobject2, alpha);
    if (alpha == 0) {
      this.points = mobject1.points.clone();
      return this;
    }
    if (alpha == 1) {
      this.points = mobject2.points.clone();
      return this;
    }

    pathFunc = defineUndef(pathFunc, (a, b, t) => nj.add(nj.multiply(a, 1 - t), nj.multiply(b, t)));
    this.points = pathFunc(mobject1.points, mobject2.points, alpha);
    return this;
  }

  /**
   * 
   * @param {Mobject} mobject2 
   * @param {Mobject} mobject2 
   * @param {number} alpha 
   */
  interpolateColor(mobject1, mobject2, alpha) {
    if (alpha == 0) {
      this.fillColor = mobject1.fillColor;
      this.strokeColor = mobject1.strokeColor;
      this.fillOpacity = mobject1.fillOpacity;
      this.strokeOpacity = mobject1.strokeOpacity;
      this.opacity = mobject1.opacity;
      this.fade(mobject1.opacity);
      return this;
    }
    if (alpha == 1) {
      this.fillColor = mobject2.fillColor;
      this.strokeColor = mobject2.strokeColor;
      this.fillOpacity = mobject2.fillOpacity;
      this.strokeOpacity = mobject2.strokeOpacity;
      this.fade(mobject2.opacity);
      return this;
    }
    this.fillColor = mobject1.fillColor.interpolate(mobject2.fillColor, alpha);
    this.strokeColor = mobject1.strokeColor.interpolate(mobject2.strokeColor, alpha);
    this.fillOpacity = mobject1.fillOpacity * (1 - alpha) + mobject2.fillOpacity * alpha;
    this.strokeOpacity = mobject1.strokeOpacity * (1 - alpha) + mobject2.strokeOpacity * alpha;
    this.fade(mobject1.opacity * (1 - alpha) + mobject2.opacity * alpha);
    return this;
  }



  /**
   * Check if this `Mobject` contains points.
   * @returns {boolean}
   */
  hasPoints() {
    return this.points.shape[0] > 0;
  }

  /**
   * Check if this `Mobject` *does not* contains points.
   * @returns {boolean}
   */
  hasNoPoints() {
    return !this.hasPoints();
  }

  throwErrorIfNoPoints() {
    if (this.hasNoPoints()) {
      throw new Error("Cannot call function for a Mobject with no points.");
    }
  }

  
  getStartAndEnd() {
    return [this.getStart(), this.getEnd()];
  }

  getStart() {
    return this.getPoint(0);
  }

  getEnd() {
    return this.getPoint(this.points.shape[0] - 1);
  }

  /**
   * 
   * @param {Ndarray} start The new starting position.
   * @param {Ndarray} end The new ending position.
   * @returns {this}
   */
  putStartAndEndOn(start, end) {
    let [currStart, currEnd] = this.getStartAndEnd();
    let currVector = nj.subtract(currEnd, currStart);
    if (currVector = nj.zeros(3)) {
      throw new Error("Cannot position endpoints of a closed loop!");
    }
    let targetVector = nj.subtract(end, start);

    return this;
  }  
  
  /**
   * Sets the alpha channels pf `this.fillColor` and `this.strokeColor` to their defaults (`this.fillOpacity` and `this.strokeOpacity`, respectively) multiplied by the given `opacity`.
   * @param {number} opacity Opacity value to set the fill and stroke.
   * @returns {this}
   */
  fade(opacity) {
    Validation.testNumberInRange({opacity}, 0, 1);
    this.opacity = opacity;
    this.fillColor.setAlpha(this.fillOpacity * opacity);
    this.strokeColor.setAlpha(this.strokeOpacity * opacity);
    return this;
  }
  
  setOpacity(opacity) {
    return this.fade(opacity);
  }
  

  //
  /**Get the number of points that define the mobjects shape.
   * 
   * @returns {number}
   */
  getNumPoints() {
    return  this.points.shape[0];
  }
  
  
  




  // Family matters
  
  /**Get this moject's family (this mobject and all of its children and their children and so on).
   * 
   * @param {boolean | true} recurse Whether or not to recursively include grandchild mobjects (submobjects of submobjects).
   * @returns {Mobject[]}
   */
  getFamily(recurse=true) {
    let subFamilies = [];
    this.submobjects.forEach(mobject => {
      subFamilies = subFamilies.concat(mobject.getFamily());
    });
    let allMobjects = [this].concat(subFamilies);
    return Array.from(new Set(allMobjects));
  }

  /**Get an array of the subset of all mobjects (the family) with points. 
   * 
   * @returns {Mobject[]}
   */
  familyMembersWithPoints() {
    return this.getFamily().filter(mobject => mobject.getNumPoints() > 0);
  }
}

class _AnimationBuilder {
  constructor(mobject, animationKwargs) {
    this.mobject = mobject;
    this.targetMobject = mobject.copy();
    this.animationKwargs = defineUndef(animationKwargs, {});
  }
  
  buildAnimation() {
    console.log("built");
    console.log(this.mobject);
    console.log(this.targetMobject);
    return new Animation(this.mobject, this.targetMobject, this.animationKwargs);
  }
}

export {Mobject};