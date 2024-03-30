/**Mathematical Object: base class for objects that can be displayed on screen.
 * 
 * @param {Mobject[]} submobjects The contained objects.
 * @param {nj.NdArray} points The points of the objects.
 */
class Mobject {
  constructor(name=null, dim=3, target=null, zIndex=0) {
    this.name = name || this.constructor.name;
    this.dim = dim;
    this.target = target;
    this.zIndex = zIndex;
    this.pointHash = null;
    this.submobjects = [];
    //self.updaters: list[Updater] = []
    //self.updating_suspended = False
    //self.color = ManimColor.parse(color)

    this.resetPoints();
    this.generatePoints();
    this.initColors();
  }

  // animationOverrideFor() {}
  // addIntrinsicAnimationOverrides() {}
  // addAnimationOverride() {}
  // setDefault() {}
  // animate() {}

  /** Sets `points` to be an empty array.
   */
  resetPoints() {
    this.points = Array(this.dim).fill(0);
  }

  /**Initializes `points` and therefore the shape.
   * 
   * Gets called upon creation. This is an empty method that can be implemented by
   * subclasses.
   */
  generatePoints() {
    
  }
  /**Initializes the colors.
   * 
   * Gets called upon creation. This is an empty method that can be implemented by
   * subclasses.
   */
  initColors() {
    
  }

  /**Add mobjects as submobjects. The mobjects are added to `this.submobjects`.
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
      throw new Error("Mobject cannot contain self");
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
    console.log(uniqueMobjects);
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
    kvp.forEach((key, value) => {
      this[key] = value;
      this.width
    });

    return this;
  }
  
  /**
   * Gets the width (X dimension) of the mobject.
   * @returns {number}
   *//**
   * Sets the mobject's width (X dimension) to the given value.
   * @param {number} value 
   */
  width() {
    return this.lengthOverDim(0);
  }
  width(value) {
    this.scaleToFitWidth(value);
  }
  
  /**
   * Gets the height (Y dimension) of the mobject.
   * @returns {number}
   *//**
   * Sets the mobject's height (Y dimension) to the given value.
   * @param {number} value 
   */
  height() {
    return this.lengthOverDim(1);
  }
  height(value) {
    this.scaleToFitHeight(value);
  }
  
  /**
   * Gets the depth (Z dimension) of the mobject.
   * @returns {number}
   *//**
   * Sets the mobject's depth (Z dimension) to the given value.
   * @param {number} value 
   */
  depth() {
    return this.lengthOverDim(2);
  }
  depth(value) {
    this.scaleToFitDepth(value);
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
  
  applyToFamily() {}

  /**Shift by the given vectors.
   * 
   * @param  {...number[]} vectors Vectors to shift by. If multiple vectors are given, they are added together.
   * @returns {this}
   */
  shift(...vectors) {
    let totalVector = vectors.reduce((acc, vector) => nj.add(acc, vector), nj.zeros(3));
    
    // Shift the points of all "family members" who have points by the total vector.
    this.familyMembersWithPoints().forEach(mobject => {
      mobject.points = mobject.points.map(point => nj.add(point, totalVector));
    });

    return this;
  }



  //
  /**Get the number of points that define the mobjects shape.
   * 
   * @returns {number}
   */
  getNumPoints() {
    return this.points.length;
  }
  
  
  




  // Family matters
  
  /**
   * 
   * @param {boolean | true} recurse
   * @returns {Mobject[]}
   */
  getFamily(recurse=true) {
    let subFamilies = [];
    this.submobjects.forEach(mobject => {
      subFamilies.concat(mobject.getFamily());
    });
    let allMobjects = [this].concat(subFamilies);
    return Array.from(new Set(...allMobjects));
  }


  familyMembersWithPoints() {
    return this.getFamily().filter(mobject => mobject.getNumPoints() > 0);
  }
}