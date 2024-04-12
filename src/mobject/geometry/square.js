class Square extends GMobject {
  constructor(kwargs) {
    super(kwargs);

    this.resetPoints();
    this.generatePoints();
    this.initColors();
  }
  generatePoints() {
    let hs = 100/2; // half the width/size/side length
    this.points = nj.array([[-hs, hs, hs, -hs, -hs],[hs, hs, -hs, -hs, hs],[0, 0, 0, 0, 0]]);
  }
  getCenter() {
    // sums all the x- and y- (and z-) components individually and divides the resulting point by 4; average position of corners;
    return nj.divide(nj.dot(this.points, nj.array([1, 1, 1, 1]).reshape(4, 1)), 4)
  }
  drawGraphics(p5) {
    //super.drawGraphics(p5);
    const hWidth = this.width()/2;
    const hHeight = this.height()/2;
    let dims = this.strokeWeight == 0 ? [hWidth, hHeight] : [hWidth - this.strokeWeight/2, hHeight - this.strokeWeight/2];
    let fc = p5.getColor(this.fillColor);
    let sc = p5.getColor(this.strokeColor);
    fc.setAlpha(this.fillOpacity);
    sc.setAlpha(this.strokeOpacity);
    
    this.graphics.noStroke();
    this.graphics.fill(fc);
    this.graphics.beginShape();
    for (let i = 0; i < this.points.shape[1]; i++) {
      this.graphics.vertex(this.points.get(0, i), this.points.get(1, i));
    }
    this.graphics.vertex(this.points.get(0, 0), this.points.get(1, 0));
    this.graphics.endShape(this.graphics.LINES);
    //this.graphics.rect(-dims[0]/2, -dims[1]/2, dims[0], dims[1]);
    //this.graphics.rect(-100/2, -100/2, 100, 100);
    
    this.graphics.stroke(sc);
    this.graphics.strokeWeight(this.strokeWeight);
    this.graphics.noFill();
    if (this.strokeWeight > 0) {
      this.graphics.beginShape();
      for (let i = 0; i < this.points.shape[1]; i++) {
        this.graphics.vertex(this.points.get(0, i), this.points.get(1, i));
      }
      this.graphics.endShape(this.graphics.LINES);
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
    if (!(gmobject instanceof GMobject)) {
      throw new TypeError("Model `gmobject` passed into `GMobject.pointwiseBecomePartial()` must be a GMobject also.");
    }
    
    if (a <= 0 && b >= 1) {
      this.setPoints(gmobject.points);
      return this;
    }
    
    let distsBetweenPoints = gmobject.getDistanceBetweenPointsOnPerimeter();
    let perimeter = distsBetweenPoints.reduce((acc, x) => acc + x);
    let targetPerimeters = [perimeter * a, perimeter * b];
    let accumulatedPerimeter = 0;
    let estimates = [0, 0]; // startOver, endOver
    let estimateIndices = [-1, -1];


    for (let i = 0; i < distsBetweenPoints.length; i++) {
      if (accumulatedPerimeter >= targetPerimeters[0] && estimateIndices[0] == -1) {
        estimates[0] = accumulatedPerimeter;
        estimateIndices[0] = i;
      }
      if (accumulatedPerimeter >= targetPerimeters[1] && estimateIndices[1] == -1) {
        estimates[1] = accumulatedPerimeter;
        estimateIndices[1] = i;
      }
      accumulatedPerimeter += distsBetweenPoints[i];
    }
    let differences = [estimates[0] - targetPerimeters[0], estimates[1] - targetPerimeters[1]];
    let interpolationBetweenPoints = differences.map((diff, i) => diff/distsBetweenPoints[i]);
    console.log(estimateIndices);
    console.log(differences);
    console.log(interpolationBetweenPoints);
    let points = gmobject.points.slice(null, [estimateIndices[0], estimateIndices[1]]);
    let secondLastPoint = gmobject.points.slice(null, [estimateIndices[1]-1, estimateIndices[1]]);
    let lastPoint = gmobject.points.slice(null, [estimateIndices[1], estimateIndices[1] + 1]);
    let correctLastPoint = nj.add(lastPoint, nj.multiply(nj.subtract(secondLastPoint, lastPoint), interpolationBetweenPoints[1]));
    points = nj.concatenate(points, correctLastPoint);
    this.points = points;
  }
}