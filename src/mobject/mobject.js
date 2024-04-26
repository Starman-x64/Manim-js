import { Validation, defineUndef } from "../utils/validation.js";
import { Point3D } from "../point3d.js";
import { ORIGIN, OUT } from "../mathConstants.js";
import { ManimColor, TRANSPARENT, WHITE } from "../color/manimColor.js";
import { Animation } from "../animation/animation.js";
import { NotImplementedError, ValueError } from "../error/errorClasses.js";
import { Paths } from "../utils/paths.js";
import { DEFAULT_LINE_WIDTH } from "../constants.js";

class MobjectReference extends Number {
  /**
   * Return ~~(a copy of)~~ the `Mobject` represented by the `MobjectReference`.
   * @returns {Mobject}
   */
  get obj() {
    return Mobject.MOBJECTS.get(this);
  }
}

const DEFAULT_MOBJECT_STYLE = new Map([
  ["fillColor", new ManimColor(TRANSPARENT)],
  ["strokeColor", new ManimColor(WHITE)],
  ["lineWidth", DEFAULT_LINE_WIDTH],
])

/**
 * Mathematical Object: base class for objects that can be displayed on screen.
 * 
 * @param {MobjectReference[]} submobjects The contained objects.
 * @param {number[][]} points The points of the objects.
 */
class Mobject {
  static MOBJECTS = new Map();
  
  /**
   * Generate a new `Mobject` ID.
   * @returns {MobjectReference}
   */
  static _generateId() {
    // salt and
    let pepper = document.timeline.currentTime * 10e2 + math.sin((Mobject.MOBJECTS.size + 0.1) - 0.1) * 10e16;
    let soup = pepper.toString();
    let hash = 0, chr; 
    for (let i = 0; i < soup.length; i++) {
      chr = soup.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return new MobjectReference(hash);
  }

  /**
   * @param {{name: string, style: Map}} kwargs 
   */
  constructor(kwargs={}) {
    /**
     * Unique ID which refers to this `Mobject`.
     * @type {MobjectReference}
     */
    this._id = Mobject._generateId();
    Mobject.MOBJECTS.set(this.ref, this);
    
    if (Validation.isOfClass(this, Mobject)) {
      this._init(kwargs);
    }
  }

  _init(kwargs) {
    /**
     * The name of the `Mobject`.
     * @type {String}
     */
    this.name = defineUndef(kwargs.name, this.constructor.name);
    
    /**
     * The name of the `Mobject`.
     * @type {Map}
     */
    this.style = defineUndef(kwargs.style, MobjectStyle.MOBJECT);

    /**
     * List of references to this `Mobject`'s child `Mobject`s.
     * @type {MobjectReference[]}
     */
    this.submobjects = [];
    
    /**
     * The points which define the `Mobject`'s shape.  
     * Some `Mobject`s' shapes may not be defined by a series of shapes.
     * In these cases, `this.points` will contain one point; the position of the `Mobject`.
     * @type {Number[][]}
     */
    this._points = [];
    
    this.initMobject(kwargs);
  }
  
  
  /**
   * Reference to the `Mobject`.
   * @returns {MobjectReference}
   */
  get ref() {
    return this._id;
  }
  
  /**
   * Get a copy of the `Mobject`'s points.
   */
  get points() {
    return structuredClone(this._points);
  }

  /**
  * @param {Number[][]} points
   */
  set points(points) {
    let newPoints = structuredClone(points);
    this._points = newPoints;
  }
  
  /**
   * Get a copy of the `Mobject`'s points, with `1` appended at the end of each.
   */
  get augmentedPoints() {
    let points = structuredClone(this._points);
    points.forEach(x => { x.push(1); });
    return points;
  }
  
  /**
   * @param {Number[][]} augmentedPoints
   */
  set augmentedPoints(augmentedPoints) {
    let points = structuredClone(augmentedPoints);
    points.forEach(x => { x.pop(); });
    this._points = points;
  }
  
  get center() {
    let maxs = math.max(this.points, 0);
    let mins = math.min(this.points, 0);
    return math.mean([maxs, mins], 0);
  }
  
  /**
   * Gets the width (X dimension) of the mobject.
   * @returns {Number}
   */
  get width() {
    return this.lengthOverDim(0);
  }
  
  /**
   * Gets the height (Y dimension) of the mobject.
   * @returns {number}
   */
  get height() {
    return this.lengthOverDim(1);
  }
  
  /**
   * Gets the depth (Z dimension) of the mobject.
   * @returns {number}
   */
  get depth() {
    return this.lengthOverDim(2);
  }
  
  /**
   * Set the `Mobject`'s width (X dimension) to the given value.
   * @param {Number} value 
   */
  set width(value) {
    this.scaleToFitLength(0, value);
  }

  /**
   * Set the `Mobject`'s height (Y dimension) to the given value.
   * @param {number} value 
   */
  set height(value) {
    this.scaleToFitLength(1, value);
  }
  
  /**
   * Set the `Mobject`'s depth (Z dimension) to the given value.
   * @param {number} value 
   */
  set depth(value) {
    this.scaleToFitLength(2, value);
  }

  get color() { return new ManimColor(this.fillColor) };
  set color(newColor) { this.fillColor = new ManimColor(newColor) };

  // get fillColor() { return this.style.get("fillStyle"); }
  // get strokeColor() { return this.style.get("strokeStyle"); }
  // get color() { return this.style.get("color") === null ? [this.fillColor, this.strokeColor] : this.style.get("color"); }

  // set fillColor(color) { this.style.set("fillColor", new ManimColor(color)); }
  // set strokeColor(color) { this.style.set("strokeColor", new ManimColor(color)); }
  // set color(color) {
  //   this.style.set("color", new ManimColor(color));
  //   if (color !== null) {
  //     this.fillColor = this.color;
  //     this.fillColor = this.color;
  //   }
  // }
  
  /**
   * The number of points the `Mobject` has. 
   */
  get numPoints() {
    return this._points.length;
  }
  
  /**
   * The length of the `Mobject` across the given dimension.  
   * Computes the range (`max - min`) of the `Mobject`'s points in the specified dimension.
   * @param {Number} dimension The dimension to measure the length over.
   * @returns {number}
   */
  lengthOverDim(dimension) {
    let max = math.max(this.points, 0)[dimension];
    let min = math.min(this.points, 0)[dimension];
    return max - min;
  }
  
  /**
   * Scale the mobject along an axis so that its length in that dimension matches the one provided.
   * @param {Number} dimension Which dimension (x=0, y=1, z=2) to scale in.
   * @param {Number} length The length to match.
   */
  scaleToFitLength(dimension, length) {
    let currentLength = this.lengthOverDim(dimension);
    let scaleFactor = length / currentLength; // TODO: what if the currentLength == 0?
    let [sf, d] = [scaleFactor, dimension];
    let scaleFactors = [(sf-1)*(d==0)+1, (sf-1)*(d==1)+1, (sf-1)*(d==2)+1];

    this.scale(scaleFactors);
  }
  
  /**
   * Create and return an identical clone of the `Mobject` including all submobjects.  
   * The clone's `_id` is reset upon creation.
   * The clone is initially not visible in the `Scene`, even if the original was.
   * 
   * @param {Boolean} ephemeral If `true`, the `Mobject` is not assigned a new id and is not added th`Mobject.MOBJECTS`. Used when `Renderer` passes a copy the `Mobject` with points transformed into the canvas' coordinate space.
   * @returns {Mobject} The copy.
   */
  clone(ephemeral=false) {
    /** @type {this} */
    let clone = Object.create(
      Object.getPrototypeOf(this), 
      Object.getOwnPropertyDescriptors(this) 
    );
    
    /** @type {MobjectStyle} */
    let cloneStyle = Object.create(
      Object.getPrototypeOf(this.style), 
      Object.getOwnPropertyDescriptors(this.style) 
    );

    clone.style = cloneStyle;
      
    if (ephemeral) return clone;
    
    clone._id = Mobject._generateId();
    Mobject.MOBJECTS.set(clone.ref, clone);
    return clone;
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
  initMobject(kwargs) {
    this.initStyle(kwargs);
    this.resetPoints();
    this.generatePoints();
    this.initColors();
  }

  initStyle(kwargs) {
    /** @type {ManimColor} */
    this.fillColor = new ManimColor(defineUndef(kwargs.fillColor, TRANSPARENT));
    /** @type {ManimColor} */
    this.strokeColor = new ManimColor(defineUndef(kwargs.strokeColor, WHITE));
    /** @type {Number} */
    this.lineWidth = defineUndef(kwargs.lineWidth, DEFAULT_LINE_WIDTH);

  }
  

  /* [markdown]
   * ## Submobject Operations
   * - `add(...mobjects: MobjectReference[])`
   * - `insert(index: int, mobject: MobjectReference)`
   * - `addToBack(...mobjects: MobjectReference[])`
   * - `remove(...mobjects: MobjectReference[])`
   */
  
  /**
   * Add mobjects as submobjects. The mobjects are added to `this.submobjects`.
   * 
   * A mobject cannot contain itself, and it cannot contain a submobject
   * more than once. If the parent mobject is displayed, the newly-added
   * submobjects will also be displayed (i.e. they are automatically added
   * to the parent Scene).
   * 
   * @param {...Mobject | MobjectReference} mobjects The mobjects to add.
   * @returns {this}
   */
  add(...mobjects) {
    let mobjectReferences  = mobjects.map(x => Validation.isOfClass(x, Mobject) ? x.ref : x);
    // Error checking
    if (mobjectReferences.includes(this.ref)) {
      throw new ValueError("Mobject cannot contain self");
    }
    mobjectReferences.forEach((reference, i) => {
      if (!Validation.isOfClass(reference, MobjectReference)) {
        throw new TypeError("All submobjects must be of type Mobject");
      }
    });


    let existingChildren = mobjectReferences.filter(mobject => this.submobjects.includes(mobject));
    if (existingChildren.length > 0) {
      console.warn(`Some Mobjects are already children of their parent, adding again is not possible. These cases are ignored.`);
    }

    /*
     * Creates an `Array` excluding mobjects that are already children.
     * `Array` is converted into a `Set` which will remove duplicates, before being turned back into an `Array`.
     */ 
    let uniqueMobjects = Array.from(new Set(mobjectReferences.filter(mobject => !existingChildren.includes(mobject))));
    // console.log(uniqueMobjects);
    if (uniqueMobjects.length != mobjectReferences.length - existingChildren.length) {
      console.warn("Attempted adding some Mobject as a child more than once, this is not possible. Repetitions are ignored."); 
    }
    
    // Append mobjects to `this.submobjects`
    this.submobjects = this.submobjects.concat(uniqueMobjects);
    return this;
  }

  /**
   * Inserts a mobject at a specific position into `this.submobjects`.
   * 
   * Effectively just calls `this.submobjects.splice(index, 0, mobject)`.
   * 
   * Highly adapted from `Mobject.add`.
   * 
   * @param {number} index The index at which to insert the given mobject.
   * @param {Mobject | MobjectReference} mobject The mobject to insert.
   * @returns {void}
   */
  insert(index, mobject) {
    let mobjectReference  = Validation.isOfClass(mobject, Mobject) ? mobject.ref : mobject;
    // Error checking
    if (mobjectReference === this.ref) {
      throw new Error("Mobject cannot contain self");
    }
    if (!Validation.isOfClass(mobjectReference, MobjectReference)) {
      throw new TypeError("All submobjects must be of type Mobject");
    }
    if (this.submobjects.includes(mobjectReference)) {
      console.warn(`Mobject is already a child of parent, adding again is not possible. This is ignored.`);
      return;
    }
    
    // Insert at desired index
    this.submobjects.splice(index, 0, mobjectReference);
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
   * @param  {...Mobject | MobjectReference} mobjects The mobjects to add.
   * @returns {this}
   */
  addToBack(...mobjects) {
    let mobjectReferences = mobjects.map(x => Validation.isOfClass(x, Mobject) ? x.ref : x);
    // Error checking
    if (mobjectReferences.includes(this.ref)) {
      throw new Error("Mobject cannot contain self");
    }
    mobjectReferences.forEach((reference, i) => {
      if (!Validation.isOfClass(reference, MobjectReference)) {
        throw new TypeError("All submobjects must be of type Mobject");
      }
    });
    let uniqueMobjects = Array.from(new Set(mobjectReferences));
    if (uniqueMobjects.length != mobjectReferences.length) {
      console.warn("Attempted adding some Mobject as a child more than once, this is not possible. Repetitions are ignored."); 
    }

    // If any mobjects we want to add are already children, remove them, but then prepend them with the other mobjects.
    this.submobjects = this.submobjects.filter(mobject => !mobjectReferences.includes(mobject));
    this.submobjects.splice(0, 0, ...uniqueMobjects);
    
    return this;
  }

  /**Removes the given mobjects from `this.submobjects` if they exist.
   * 
   * @param  {...Mobject | MobjectReference} mobjects The mobjects to remove.
   * @returns {this}
   */
  remove(...mobjects) {
    let mobjectReferences = mobjects.map(x => Validation.isOfClass(x, Mobject) ? x.ref : x);
    this.submobjects = this.submobjects.filter(mobject => !mobjectReferences.includes(mobject));
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
  

  /* [markdown]
   * ## Point Transformations
   * - `linearTransformation(transformationMatrix: number[][])`
   * - `linearTransformation4D(transformationMatrix: number[][])`
   * - `shift(...vectors: float[][])`
   * - `scale(scaleFactor: float | float[], center?: float[])`
   * - `rotate(angle: float, { axis: float[], center: float[] })`
   */
  
  /**
   * Apply a generic linear transformation to the `Mobject`'s `this.points`.
   * 
   * Default behavior is to scale about the center of the mobject.
   * 
   * @param  {Number[][]} transformationMatrix The 3x3 transformation matrix
   * @returns {this}
   */
  linearTransformation(transformationMatrix, kwargs) {
    this.getFamily().forEach(mobject => {
      // Matrix is postmultiplied because points are row-major.
      mobject.obj.points = math.multiply(mobject.obj.points, transformationMatrix);
    });
    return this;
  }
  
  /**
   * Apply a 4x4 linear transformation to the `Mobject`'s `this.points`.
   * 
   * Default behavior is to scale about the center of the mobject.
   * 
   * @param  {Number[][]} transformationMatrix The 4x4 transformation matrix
   * @returns {this}
   */
  linearTransformation4D(transformationMatrix, kwargs) {
    this.applyToFamily((mobject) => {
      // Matrix is postmultiplied because points are row-major.
      mobject.obj.augmentedPoints = math.multiply(mobject.obj.augmentedPoints, transformationMatrix);
    });
    return this;
  }

  /**
   * Apply a function to `this` and every submobject with points recursively.
   * 
   * @param {(mobject: MobjectReference) => void} func The function to apply to each mobject. `func` gets passed the respective (sub)mobject as parameter.
   * @returns {this}
   */
  applyToFamily(func) {
    this.getFamily().forEach(func);
    return this;
  }
  
  /**
   * Shift by the given vectors.
   * 
   * @param  {...number[]} vectors Vectors to shift by. If multiple vectors are given, they are added together.
   * @returns {this}
   */
  shift(...vectors) {
    let totalVector = vectors.reduce((acc, vector) => math.add(acc, vector), [0, 0, 0]);
    // console.log(this.constructor.name, this.familyMembersWithPoints());
    this.applyToFamily((mobject) => {
      let newPoints = [];
      for (let point of mobject.obj.points) {
        newPoints.push(math.add(point, totalVector));
      }
      mobject.obj.points = newPoints;
    });

    return this;
  }
  
  /**
   * Scale the size by a factor.  
   * Default behavior is to scale about the center of the `Mobject` (`this.center`).
   * @param  {Number | Number[]} scaleFactor The scaling factor `α`. If `0 < |α| < 1`, the mobject will shrink, and for :math:`|α| > 1` it will grow. Furthermore, if :math:`α < 0`, the mobject is also flipped. An array of 3 numbers can be passed for different scaling in each axis.
   * @param  {Number[]} center The center point to scale from.
   * @returns {this}
   */
  /* [markdown]
   * Applies the following matrix to the points:
   * $$
   * \begin{align}
   * \mathbf{M} &= \mathbf{T}\mathbf{S}\mathbf{T}^{-1} \\
   * &=
   * \begin{bmatrix}
   * \alpha_{x} & 0 & 0 & 0 \\
   * 0 & \alpha_{y} & 0 & 0 \\
   * 0 & 0 & \alpha_{z} & 0 \\
   * \Delta x (1-\alpha_{x}) & \Delta y (1-\alpha_{y}) & \Delta z (1-\alpha_{z}) & 1
   * \end{bmatrix}
   * \end{align}
   * $$
   * 
   * where $\mathbf{T}$ translates `center` ($\begin{bmatrix}\Delta x & \Delta y & \Delta z\end{bmatrix}$) to the orign, and $\mathbf{S}$ scales by $\alpha$ about the origin.
   */
  scale(scaleFactor, center=this.center) {
    let [dx, dy, dz] = center;
    let [ax, ay, az] = Validation.isNumber(scaleFactor) ? [scaleFactor, scaleFactor, scaleFactor] : scaleFactor;
    let matrix4D = [
      [ax,  0,  0,  0],
      [ 0, ay,  0,  0],
      [ 0,  0, az,  0],
      [dx*(1-ax), dy*(1-ay), dz*(1-az), 1]
    ]
    this.linearTransformation4D(matrix4D);

    return this;
  }

  applyPointsFunctionAboutPoint(func, point) {
    point = defineUndef(point, ORIGIN.clone());
    // console.log(point.toString());
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
    // console.log(point.toString());
    // console.log(subtractPoint.toString());
    // console.log(addPoint.toString());
    this.familyMembersWithPoints().forEach(mobject => {
      let ones = nj.ones(mobject.points.shape[0]).reshape(-1,1);
      // console.log(mobject.points.toString());
      // console.log(ones.toString());
      let newPoints;
      if (mobject.points.shape.length == 1) {
        newPoints = nj.array([...(mobject.points.selection.data), 1]);
      }
      else {
        newPoints = nj.concatenate(mobject.points, ones);
      }
      let originalShape = [...(mobject.points.shape)];
      newPoints = nj.dot(newPoints, subtractPoint);
      newPoints = func(newPoints.slice(null,[-1]));
      if (mobject.points.shape.length == 1) {
        newPoints = nj.array([...(mobject.points.selection.data), 1]);
      }
      else {
        newPoints = nj.concatenate(mobject.points, ones);
      }
      newPoints = nj.dot(newPoints, addPoint);
      if (mobject.points.shape.length == 1) {
        mobject.points = newPoints.slice([-1]);
      }
      else {
        mobject.points = newPoints.slice(null,[-1]);
      }
      // console.log(mobject.points.toString());
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
    
    kwargs = defineUndef(kwargs, { center: this.getCenter() });
    kwargs.center = defineUndef(kwargs.center, this.getCenter());
    this.applyPointsFunctionAboutPoint(points => nj.dot(points, rotationmatrix), kwargs.center);
    
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

    pathFunc = defineUndef(pathFunc, Paths.straightPath());
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
  
  /**
   * Get this moject's family (this mobject and all of its children and their children and so on).
   * 
   * @param {boolean | true} recurse Whether or not to recursively include grandchild mobjects (submobjects of submobjects).
   * @returns {MobjectReference[]}
   */
  getFamily(recurse=true) {
    /** @type {MobjectReference[]} */
    let subFamilies = [];
    this.submobjects.forEach(mobject => {
      subFamilies = subFamilies.concat(mobject.obj.getFamily());
    });
    let allMobjects = [this.ref].concat(subFamilies);
    return Array.from(new Set(allMobjects));
  }

  /**Get an array of the subset of all mobjects (the family) with points. 
   * 
   * @returns {Mobject[]}
   */
  familyMembersWithPoints() {
    return this.getFamily().filter(mobject => mobject.getNumPoints() > 0);
  }








  /**
   * Sets `this._points` to be an empty array.
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
}


class MobjectStyle {
  static MOBJECT = new MobjectStyle({
    fillColor: new ManimColor(TRANSPARENT),
    strokeColor: new ManimColor(WHITE),
    lineWidth: DEFAULT_LINE_WIDTH,
  });

  /**
   * 
   * @param {{fillColor: ManimColor, strokeColor: ManimColor, lineWidth: Number, color?: ManimColor}} style 
   */
  constructor(style={
    fillColor,
    strokeColor,
    lineWidth,
    color
  }) {
    this.fillColor = new ManimColor(defineUndef(style.fillColor, TRANSPARENT));
    this.strokeColor = new ManimColor(defineUndef(style.strokeColor, WHITE));
    this.lineWidth = defineUndef(style.lineWidth, DEFAULT_LINE_WIDTH);
    
    this.color = defineUndef(style.color, null);
    
    if (this.color !== null) {
      this.fillColor = this.color;
      this.strokeColor = this.color;
    }
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

export { Mobject, MobjectReference, MobjectStyle, DEFAULT_MOBJECT_STYLE };