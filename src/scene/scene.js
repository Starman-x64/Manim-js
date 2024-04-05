class Scene {
  constructor(args) {
    
    this.mobjects = [];
    this.animationQueue = [];
    this.currentAnimationCollection = new _AnimationCollection();
    
  }

  initialize() {
    this.sketch = ( p5 ) => {
      this.p5 = p5;
      
      p5.setup = () => { this.setup(p5); };
      p5.draw = () => { this.draw(p5); };
    };
  }

  runSketch() {
    new p5(this.sketch);
  }

  /**
   * This is meant to be implemented by any scenes which
   * are commonly subclassed, and have some common setup
   * involved before the construct method is called.
   */
  setup(p5) {
    
  }

  draw(p5) {
    /*
    draw background and stuff
    */
    this.animate(1/60);
    this.mobjects.forEach(mobject => { mobject.draw(p5); });
  }

  /**
   * This is meant to be implemented by any scenes which
   * are commonly subclassed, and have some common method
   * to be invoked before the scene ends.
   */
  tearDown() {
    
  }

  /**Add content to the Scene.
   * 
   * From within `Scene.construct`, display mobjects on screen by calling
   * `Scene.add()` and remove them from screen by calling `Scene.remove()`.
   * All mobjects currently on screen are kept in `Scene.mobjects`.  Play
   * animations by calling `Scene.play()`.
   * 
   * Initialization code should go in `Scene.setup()`.  Termination code should
   * go in `Scene.tear_down()`.
   * 
   * A typical manim script includes a class derived from `Scene` with an
   * overridden `Scene.contruct()` method:
   * @example
   * class MyScene extends Scene {
   *  construct() {
   *    this.play(Write(Text("Hello World!")));
   *  }
   * }
   */
  construct() {
    
  }

  /**Begins updating all mobjects in the Scene.
   * 
   * @param {number} dt Change in time between updates. Defaults (mostly) to `1/framesPerSecond`.
   */
  updateMobjects(dt) {
    this.mobjects.forEach(mobject => mobject.update(dt));
  }

  /**Play queued animations frabe-by-frame.
   * 
   */
  animate(dt) {
    // Check if the animations at the start of the queue have been completed.
    if (this.currentAnimationCollection.allAnimationsComplete()) {
      this.currentAnimationCollection.animations.forEach(animation => { animation.finish(); animation.cleanUpFromScene(this); });
      this.currentAnimationCollection = this.animationQueue.shift();
      console.log("scene.<prop>(currentAnimationCollection).<prop>(animations):\n");
      console.log(this.currentAnimationCollection.animations);
      //this.currentAnimationCollection.animations.forEach(animation => { animation.setupScene(this); animation.begin(); });
    }
    // Advance the animation.
    //this.currentAnimationCollection.animations.forEach(animation => { animation.step(dt); });
  }

  /**Add mobjects to scene.
   * 
   * Mobjects will be displayed, from background to
   * foreground in the order with which they are added.
   * 
   * If a mobject has already been added, it will be
   * removed and added again at its new position among
   * the other new mobjects.
   * 
   * @param  {...Mobject} mobjects The mobjects to add.
   * @returns {this}
   */
  add(...mobjects) {
    this.mobjects = this.mobjects.filter(mobject => !mobjects.includes(mobject));
    this.mobjects = this.mobjects.concat(mobjects);

    return this;
  }

  /**Removes mobjects in the passed list of mobjects
   * from the scene and the foreground, by removing them
   * from "mobjects" and "foreground_mobjects".
   * 
   * @param  {...any} mobjects The mobjects to remove.
   * @returns {this}
   */
  remove(...mobjects) {
    this.mobjects = this.mobjects.filter(mobject => !mobjects.includes(mobject));
    this.foregroundMobjects = this.foregroundMobjects.filter(mobject => !mobjects.includes(mobject));
    
    return this;
  }

  /**Removes all mobjects present in `this.mobjects`
   * and `this.foregroundMobjects` from the scene.
   * 
   * @returns {this}
   */
  clear() {
    this.mobjects = [];
    this.foregroundMobjects = [];

    return this;
  }

  /**Queue animations to play simultaneously.
   * 
   * @param  {...Animation} animations Animations to add to `this.animationQueue`.
   */
  play(...animations) {
    this.animationQueue.push(new _AnimationCollection(...animations));
  }
}