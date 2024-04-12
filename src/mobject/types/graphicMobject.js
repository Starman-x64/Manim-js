
class GMobject extends Mobject {
  constructor(kwargs) {
    super(kwargs);
    this.fillColor = kwargs.fillColor ? kwargs.fillColor : RED;
    this.strokeColor = kwargs.strokeColor ? kwargs.strokeColor : DARK_RED;
    this.strokeWeight = kwargs.strokeWeight !== undefined ? kwargs.strokeWeight : 5;
    this.fillOpacity = kwargs.fillOpacity !== undefined ? kwargs.fillOpacity : 255;
    this.strokeOpacity = kwargs.strokeOpacity !== undefined ? kwargs.strokeOpacity : 255;
    this.width = kwargs.width ? kwargs.width : 100;
    this.height = kwargs.height ? kwargs.height : 100;
  }

  generatePoints() {
    this.points = nj.array([[0],[0],[0]]);
  }
  setFillAndStroke(p5) {
    let fc = p5.getColor(this.fillColor);
    let sc = p5.getColor(this.strokeColor);
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
    this.graphics = p5.createGraphics(this.width, this.height);
    this.graphics.translate(this.width/2, this.height/2);
    this.drawGraphics(p5);
  }
  draw(p5) {
    //console.log(this.graphics);
    //
    p5.imageMode(p5.CENTER);
    p5.image(this.graphics, this.points.get(0,0), this.points.get(1,0));
    //p5.background(50);

    // this.pg = p5.createGraphics(100, 100, p5.canvas);
    // p5.ellipse(100, 100, 20, 20);
    // this.pg.background(100);
    // this.pg.noStroke();
    // this.pg.ellipse(this.pg.width / 2, this.pg.height / 2, 50, 50);
    // p5.image(pg, 50, 50);
    // p5.image(pg, 0, 0, 50, 50);
  }
}