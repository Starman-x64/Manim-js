const DEFAULT_ANIMATION_RUN_TIME = 1.0;
const DEFAULT_ANIMATION_LAG_RATIO = 0.0;

/**An animation.
 * @class
 * @constructor
 * @public
 */
class Animation {
  /**
   * @param {{mobject: Mobject, runTime: number, lagRatio: number, reverseRateFunction: boolean, name: string,  remover: boolean, introducer: boolean, suspendMobjectUpdating: boolean, rateFunc: Function, methods: {name: string, args: any[]}[]}} kwargs Keyword arguments.
   */
  constructor(kwargs) {
    /**The mobject to be animated. This is not required for all types of animations.
     * @type {Mobject}
    */
    this.mobject = kwargs.mobject;
    /**The duration of the animation in seconds.
     * @type {number}
    */
    this.runTime = kwargs.runTime !== undefined ? kwargs.runTime : DEFAULT_ANIMATION_RUN_TIME;
    /**Defines the delay after which the animation is applied to submobjects. This lag is relative to the duration of the animation. This does not influence the total runtime of the animation. Instead the runtime of individual animations is adjusted so that the complete animation has the defined run time.
     * @type {number}
    */
    this.lagRatio = kwargs.lagRatio !== undefined ? kwargs.lagRatio : DEFAULT_ANIMATION_LAG_RATIO;
    /**Reverses the rate function of the animation. Setting `reverseRateFunction` does not have any effect on `remover` or `introducer`. These need to be set explicitly if an introducer-animation should be turned into a remover one and vice versa.
     * @type {boolean}
    */
    this.reverseRateFunction = kwargs.reverseRateFunction !== undefined ? kwargs.reverseRateFunction : false;
    /**The name of the animation. Defaults to `<class-name>(<Mobject-name>)`.
     * @type {string}
    */
    this.name = kwargs.name !== undefined ? kwargs.name : `<${this.mobject.constructor.name}>(${this.mobject.name})`;
    /**Whether the given mobject should be removed from the scene after this animation.
     * @type {boolean}
    */
    this.remover = kwargs.remover !== undefined ? kwargs.remover : false;
    /**Whether the given mobject should be addded to the scene after this animation.
     * @type {boolean}
    */
    this.introducer = kwargs.introducer !== undefined ? kwargs.introducer : false;
    /**Whether updaters of the mobject should be suspended during the animation.
     * @type {boolean}
    */
    this.suspendMobjectUpdating = kwargs.suspendMobjectUpdating !== undefined ? kwargs.suspendMobjectUpdating : true;
    /**The function defining the animation progress based on the relative runtime (see  :mod:`~.rate_functions`) . For example `rateFunc(0.5)` is the proportion of the animation that is done after half of the animations run time.
     * @type {Function}
    */
   this.rateFunc = kwargs.rateFunc !== undefined ? kwargs.rateFunc : (t) => t*t*(3 - 2*t);
    /**The methods of the animation to animate.
     * 
     * **WARNING: This functionality is not implemented correctly.**
     * @type {{name: string, args: any[]}[]}
    */
    this.methods = kwargs.methods;
    /**How many seconds have passed since the start of the animation. In its current implementation, the timer starts once `begin()` has been called, even if there is lag time (the animation hasn't visually begun).
     * @type {number}
    */
    this.animationTimer = 0;
  }
  
  getLagTime() {
    return this.lagRatio * this.runTime;
  }

  getAlpha() {
    return (this.animationTimer - this.getLagTime())/(this.runTime - this.getLagTime());
  }

  /**Begin the animation.
   * 
   * This method is called right as an animation is being played. As much
   * initialization as possible, especially any mobject copying, should live in this
   * method.
   */
  begin() {
    if (this.runTime <= 0) {
      throw new Error(`${this.name} has a runTime of <= 0 seconds, this cannot be rendered correctly. Please set the runTime to be positive.`)
    }
    
    this.startingMobject = this.createStartingMobject();
    if (this.suspendMobjectUpdating) this.mobject.suspendUpdating();
    this.interpolate(0);
  }

  step(dt) {
    if (this.animationTimer >= this.runTime) {
      this.finish();
      return;
    }
    if (this.animationTimer >= this.getLagTime()) {
      this.interpolate(this.getAlpha());
    }
    this.animationTimer += dt;
  }

  /**Finish the animation
   * 
   * This method gets called when the animation is over.
   * 
   * @returns {void}
   */
  finish() {
    this.interpolate(1);
    
    if (this.suspendMobjectUpdating && this.mobject) {
      this.mobject.resumeUpdating();
    }
  }
  
  /**Clean up the `Scene` after finishing the animation.
   * 
   * This includes to `Scene.remove()` the Animation's
   * `Mobject` if the animation is a remover.
   * 
   * @param {Scene} scene The scene the animation should be cleaned up from.
   * @returns {void}
   */
  cleanUpFromScene(scene) {
    this._onFinish(scene);
    if (this.remover) {
      scene.remove(this.mobject);
    }
  }

  /**Setup up the `Scene` before starting the animation.
   * 
   * This includes to `Scene.add()` the Animation's
   * `Mobject` if the animation is an introducer.
   * 
   * @param {Scene} scene The scene the animation should be set up in.
   * @returns {void}
   */
  setupScene(scene) {
    if (!scene) {
      return;
    }
    if (this.introducer && scene.mobjects.includes(this.mobject)) {
      scene.add(this.mobject);
      
    }
  }

  _onFinish(scene) {}

  /**Copy the animation's mobject to create a reference
   * of the starting state.
   * 
   * @returns {Mobject}
   */
  createStartingMobject() {
    return this.mobject.copy();
  }
  
  /**Get all objects involved in the animation.
   * 
   * Ordering must match the ordering of arguments to `interpolateSubmobject`.
   * 
   * @returns {Mobject[]}
   */
  getAllMobjects() {
    return [this.mobject, this.startingMobject];
  }

  getAllFamiliesZipped() { return [this.startingMobject]; }

  /**Updates things like `this.startingMobject`, and ~~(for
   * Transforms)~~ `targetMobject`.  Note, since typically
   * (always?) `this.mobject` will have its updating
   * suspended during the animation, this will do
   * nothing to `this.mobject`.
   * 
   * @param {number} dt The parameter `dt` to pass to all the update functions. Usually this is the time in seconds since the last call of `update`.
   * @returns {void}
   */
  updateMobjects(dt) {
    this.getAllMobjectsToUpdate().forEach(mobject => { mobject.update(dt); });
  }
  
  /**Get all mobjects to be updated during the animation.
   * 
   * @returns {Mobject[]} The list of mobjects to be updated during the animation.
   */
  getAllMobjectsToUpdate() {
    // The surrounding scene typically handles
    // updating of self.mobject. Besides, in
    // most cases its updating is suspended anyway.
    return this.getAllMobjects().filter(mobject => { mobject != this.mobject })
  }
  
  /**Create a copy of the animation.
   * 
   * @returns {Animation}
   */
  copy() {
    return structuredClone(this);
  }
  
  /**Set the animation progress.
   * 
   * This method gets called for every frame during an animation.
   * 
   * @param {number} alpha The relative time to set the animation to, 0 meaning the start, 1 meaning the end.
   * @returns {void}
   */
  interpolate(alpha) {
    this.interpolateMobject(this.rateFunc(alpha));
  }

  /**Interpolates the mobject of the :class:`Animation` based on alpha value.
   * 
   * @param {number} alpha A float between 0 and 1 expressing the ratio to which the animation is completed. For example, alpha-values of 0, 0.5, and 1 correspond to the animation being completed 0%, 50%, and 100%, respectively.
   */
  interpolateMobject(alpha) {
    this.methods.forEach(methodObject => {
      //console.log(methodObject.name);
      this.mobject.shiftAnimationOverride(this, alpha, nj.array([50,0,0]));
      this.mobject.scaleAnimationOverride(this, alpha, 2);
      // this.mobject.shiftAnimationOverride(this, alpha, nj.array([0,50,0]));
      //this.mobject.shift(nj.array([0,1,0]));
      //this.mobject = this.mobject[methodObject.name+"AnimationOverride"].call(this.mobject, this, alpha, ...(methodObject.args));
      //this.mobject[methodObject.name+"AnimationOverride"](this, alpha, ...(methodObject.args));
    })
  }

  isAnimationComplete() {
    return this.animationTimer >= this.runTime;
  }
}

class _AnimationCollection {
  /**
   * 
   * @param  {...Animation} animations Animations to play simultaneously.
   */
  constructor(...animations) {
    this.animations = animations;
  }
  
  /**Get whether all animations have completed.
   * 
   * Loops through all animations in the collection and returns `false` upon finding the first animation with its `animationTimer <= runTime`. Returns `true` if none are found.
   * 
   * @returns {boolean}
   */
  allAnimationsComplete() {
    for (let i = 0; i < this.animations.length; i++) {
      if(!this.animations[i].isAnimationComplete()) return false;
    }
    return true;
  }
}