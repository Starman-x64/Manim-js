
class GMobject extends Mobject {
  /**
   * @param {{fillColor: Color, strokeColor: Color, strokeWeight: number, fillOpacity: number, strokeOpacity: number, width: number, height: number, name: string, dim: number, target: Mobject|null, zIndex: number}} kwargs 
   */
  constructor(kwargs) {
    super(kwargs);
    this.fillColor = kwargs.fillColor !== undefined ? kwargs.fillColor : RED;
    this.strokeColor = kwargs.strokeColor !== undefined ? kwargs.strokeColor : DARK_RED;
    this.strokeWeight = kwargs.strokeWeight !== undefined ? kwargs.strokeWeight : 5;
    this.fillOpacity = kwargs.fillOpacity !== undefined ? kwargs.fillOpacity : 255;
    this.strokeOpacity = kwargs.strokeOpacity !== undefined ? kwargs.strokeOpacity : 255;
    //this.width = kwargs.width !== undefined ? kwargs.width : 100;
    //this.height = kwargs.height !== undefined ? kwargs.height : 100;
  }

  generatePoints() {
    this.points = nj.array([[0],[0],[0]]);
  }
  setFillAndStroke(p5) {
    let fc = this.graphics.getColor(this.fillColor);
    let sc = this.graphics.getColor(this.strokeColor);
    fc.setAlpha(this.fillOpacity);
    sc.setAlpha(this.strokeOpacity);
    this.graphics.fill(fc);
    this.graphics.stroke(sc);
    this.graphics.strokeWeight(this.strokeWeight);
  }
  drawGraphics(p5) {
    this.setFillAndStroke(p5);
  }
  p5Setup(p5) {
    console.log("width: ", this.width());
    this.graphics = p5.createGraphics(this.width(), this.height());
    this.graphics.translate(this.width()/2, this.height()/2);
    this.drawGraphics(p5);
  }
  draw(p5) {
    //console.log(this.graphics);
    //
    p5.imageMode(p5.CENTER);
    console.log(this.graphics);
    this.graphics.background(100);
    p5.image(this.graphics, 0, 0);//...(this.getCenter().selection.data)
    //p5.background(50);

    // this.pg = p5.createGraphics(100, 100, p5.canvas);
    // p5.ellipse(100, 100, 20, 20);
    // this.pg.background(100);
    // this.pg.noStroke();
    // this.pg.ellipse(this.pg.width / 2, this.pg.height / 2, 50, 50);
    // p5.image(pg, 50, 50);
    // p5.image(pg, 0, 0, 50, 50);
  }

  /**Given two bounds a and b, transforms the points of `this` into the points of the gmobject
   * passed as parameter with respect to the bounds.
   * ~~Points here stand for control points of the bezier curves (anchors and handles).~~
   * 
   * @param {GMobject} gmobject The gmobject that will serve as a model.
   * @param {number} a Upper-bound.
   * @param {number} b Lower-bound.
   */
  pointwiseBecomePartial(gmobject, a, b) {
    // since GMobjects are fundamentally different from VMobjects, this function should probably be implemented by subclass
    // (and should probably have a different name too).

    // if (!(gmobject instanceof GMobject)) {
    //   throw new TypeError("Model `gmobject` passed into `GMobject.pointwiseBecomePartial()` must be a GMobject also.");
    // }
    
    // if (a <= 0 && b >= 1) {
    //   this.setPoints(gmobject.points);
    // }
  }
}