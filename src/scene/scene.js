class Scene {
  constructor(args) {
    
    this.mobjects = [];
    this.animationQueue = [];
    this.currentAnimationCollection = new _AnimationCollection();
    
  }

  initialize() {
    this.sketch = ( p5 ) => {
      p5.getColor = (...args) => {
        let returnColor;
        if (args.length == 1) {
          switch(args[0].constructor.name) {
            case "Color":
              let color = args[0];
              let p5Color = p5.color(color.srgb.map(x => 255*x));
              // for (const [key, value] of Object.entries(p5Color)) {
              //   color[key] = value;
              // }
              returnColor = p5Color;
              break;
            default:
              returnColor = p5.color(...args);
              break; 
          }
        }
        else {
          returnColor = p5.color(...args);
        }
        return returnColor;
      };
      p5.setup = () => {
        this.setup(p5);
      };
      p5.draw = () => {
        p5.translate(p5.width/2, p5.height/2);
        p5.scale(1, -1);
        this.draw(p5);
      };
    };
  }

  runSketch() {
    this.p5 = new p5(this.sketch);
  }

  /**
   * This is meant to be implemented by any scenes which
   * are commonly subclassed, and have some common setup
   * involved before the construct method is called.
   */
  setup(p5) {
    /*
    create canvas and stuff
    */
    console.log(p5.getColor(WHITE));
    this.mobjects.forEach(mobject => { if(mobject.p5Setup) mobject.p5Setup(p5); });
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

  /**Play queued animations frame-by-frame.
   * 
   */
  animate(dt) {
    if (this.currentAnimationCollection === null) {
      return;
    }
    // Check if the animations at the start of the queue have been completed.
    if (this.currentAnimationCollection.allAnimationsComplete()) {
      this.currentAnimationCollection.animations.forEach(animation => { animation.finish(); animation.cleanUpFromScene(this); });
      this.queueNextAnimations();
    }
    // Advance the animation.
    if (this.currentAnimationCollection !== null) {
      this.currentAnimationCollection.animations.forEach(animation => { animation.step(dt); });
    }
  }

  queueNextAnimations() {
    if (this.animationQueue.length != 0) {
      this.currentAnimationCollection = this.animationQueue.shift();
      this.currentAnimationCollection.animations.forEach(animation => { animation.setupScene(this); animation.begin(); });
      return;
    }
    this.currentAnimationCollection = null;
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