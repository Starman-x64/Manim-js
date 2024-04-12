class Square extends GMobject {
  // /**
  //  * @param {number} size The size/side length of the square.
  //  * @param {{fillColor: Color, strokeColor: Color, strokeWeight: number, fillOpacity: number, strokeOpacity: number, width: number, height: number, name: string, dim: number, target: Mobject|null, zIndex: number}} kwargs 
  //  */
  // constructor(...args) {
  //   let kwargs = { size: 100 };
  //   if (args.length != 0) {
  //     if (typeof args[0] == "number") {
  //       kwargs = { size: args[0] };
  //     }
  //     else {
  //       kwargs = args[0];
  //       kwargs.size = 100;
  //     }
  //   }
  //   super(kwargs);
  //   this.size = kwargs.size;
  //   console.log(this.size);
  // }
  generatePoints() {
    let hs = 100/2; // half the width/size/side length
    this.points = nj.array([[-hs, hs, hs, -hs],[hs, hs, -hs, -hs],[0, 0, 0, 0]]);
  }
  getCenter() {
    // sums all the x- and y- (and z-) components individually and divides the resulting point by 4; average position of corners;
    return nj.divide(nj.dot(this.points, nj.array([1, 1, 1, 1]).reshape(4, 1)), 4)
  }
  drawGraphics(p5) {
    //super.drawGraphics(p5);
    this.graphics.background(100);
    let dimensions = this.strokeWeight == 0 ? [100, 100] : [100 - this.strokeWeight, 100 - this.strokeWeight];
    //console.log(this.strokeWeight);
    let fc = p5.getColor(this.fillColor);
    let sc = p5.getColor(this.strokeColor);
    fc.setAlpha(this.fillOpacity);
    sc.setAlpha(this.strokeOpacity);
    console.log(fc);
    console.log(sc);

    this.graphics.noStroke();
    this.graphics.fill(fc);
    // this.graphics.beginShape(); 
    // this.graphics.rect(-dimensions[0]/2, -dimensions[1]/2, dimensions[0], dimensions[1]);
    this.graphics.rect(-100/2, -100/2, 100, 100);
    
    this.graphics.stroke(sc);
    this.graphics.strokeWeight(this.strokeWeight);
    this.graphics.noFill();
    if (this.strokeWeight > 0) {
      this.graphics.rect(-100/2, -100/2, 100, 100);
    }
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
    
  }
}