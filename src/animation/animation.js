const DEFAULT_ANIMATION_RUN_TIME = 1.0;
const DEFAULT_ANIMATION_LAG_RATIO = 0.0;

/**An animation.
 * 
 * @param {Mobject} mobject The mobject to be animated. This is not required for all types of animations.
 * @param {number} lagRatio Defines the delay after which the animation is applied to submobjects. This lag is relative to the duration of the animation. This does not influence the total runtime of the animation. Instead the runtime of individual animations is adjusted so that the complete animation has the defined run time.
 * @param {number} runTime The duration of the animation in seconds.
 * @param {Function} rateFunc The function defining the animation progress based on the relative runtime (see  :mod:`~.rate_functions`) . For example `rateFunc(0.5)` is the proportion of the animation that is done after half of the animations run time.
 * @param {boolean} reverseRateFunction Reverses the rate function of the animation. Setting `reverseRateFunction` does not have any effect on ``remover`` or ``introducer``. These need to be set explicitly if an introducer-animation should be turned into a remover one and vice versa.
 * @param {string} name The name of the animation. Defaults to `<class-name>(<Mobject-name>)`.
 * @param {boolean} remover Whether the given mobject should be removed from the scene after this animation.
 * @param {boolean} suspendMobjectUpdating Whether updaters of the mobject should be suspended during the animation.
 */
class Animation {
  constructor(kwargs) {
    this.mobject = kwargs.mobject;
    this.runTime = kwargs.runTime ? kwargs.runTime : DEFAULT_ANIMATION_RUN_TIME;
    this.lagRatio = kwargs.lagRatio ? kwargs.lagRatio : DEFAULT_ANIMATION_LAG_RATIO;
    this.reverseRateFunction = kwargs.reverseRateFunction ? kwargs.reverseRateFunction : false;
    this.name = kwargs.name ? kwargs.name : `<${this.mobject.constructor.name}>(${this.mobject.name})`;
    this.remover = kwargs.remover ? kwargs.remover : false;
    this.introducer = kwargs.introducer ? kwargs.introducer : false;
    this.suspendMobjectUpdating = kwargs.suspendMobjectUpdating ? kwargs.suspendMobjectUpdating : true;
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
    this.interpolateMobject(alpha);
  }

  /**Interpolates the mobject of the :class:`Animation` based on alpha value.
   * 
   * @param {number} alpha A float between 0 and 1 expressing the ratio to which the animation is completed. For example, alpha-values of 0, 0.5, and 1 correspond to the animation being completed 0%, 50%, and 100%, respectively.
   */
  interpolateMobject(alpha) {
    
  }
}