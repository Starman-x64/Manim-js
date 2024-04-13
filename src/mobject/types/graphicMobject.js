
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
    this.graphics = p5.createGraphics(p5.width, p5.height);
    this.graphics.translate(p5.width/2, p5.width/2);
    this.drawGraphics(p5);
  }
  draw(p5) {
    //console.log(this.graphics);
    //
    p5.imageMode(p5.CENTER);
    p5.image(this.graphics, 0, 0);
    //p5.background(50);

    // this.pg = p5.createGraphics(100, 100, p5.canvas);
    // p5.ellipse(100, 100, 20, 20);
    // this.pg.background(100);
    // this.pg.noStroke();
    // this.pg.ellipse(this.pg.width / 2, this.pg.height / 2, 50, 50);
    // p5.image(pg, 50, 50);
    // p5.image(pg, 0, 0, 50, 50);
  }
  
  // /**
  //  * 
  //  * Doesn't work properly as `Color` from package colorjs can't be cloned with structuredclone()
  //  * @inheritdoc
  //  */
  // copy() {
  //   let copy = new GMobject({});
  //   for (let [key, value] of Object.entries(this)) {
  //     console.log(key, value, copy[key]);
  //   }
  //   copy.points = this.points.clone();
  //   return copy;
  // }

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
  
  /**Get the perimeter of the gmobject by summing up the distances between consecutive points.
   * 
   * @returns {number}
   */
  getPerimeter() {
    let perimeter = this.getDistanceBetweenPointsOnPerimeter().reduce((acc, x) => acc + x);
    return perimeter;
  }
  
  /**Get the distance between each pair of consecutiive points. The last entry in the returned array is the distance between the first and last points.
   * 
   * @returns {number[]} The nth element in the returned array is the distance between the nth and the (n+1)th point.
   */
  getDistanceBetweenPointsOnPerimeter() {
    let distances = [];
    let thisPoint;
    let nextPoint;
    for (let i = 0; i < this.points.shape[1]; i++) {
      if (!thisPoint) {
        thisPoint = this.points.slice(null, [i, i+1]).flatten();
      }
      nextPoint = i + 1 == this.points.shape[1] ? this.points.slice(null, [0, 1]).flatten() : this.points.slice(null, [i+1, i+2]).flatten()
      let displacement = nj.subtract(thisPoint, nextPoint);
      distances.push(Math.sqrt(nj.multiply(displacement, displacement).selection.data.reduce((acc, x) => acc + x)));
      thisPoint = nextPoint;
    }
    return distances;
  }
}