
class GraphicMobject extends Mobject {
  constructor(...args) {
    super(args);
    this.fillColor = args.fillColor ? args.fillColor : TRANSPARENT;
    this.strokeColor = args.strokeColor ? args.strokeColor : WHITE;
    this.width = args.width ? args.width : 100;
    this.height = args.height ? args.height : 100;
  }
  
  createGraphics(p5) {
    //console.log(this.width, this.height);
    //this.graphics = p5.createGraphics(this.width, this.height);
    this.pg = p5.createGraphics(100, 100, p5.canvas);
    console.log(this.pg);
    console.log(p5.createGraphics(100, 100, p5.canvas).createFramebuffer());
  }
  draw(p5) {
    //console.log(this.graphics);
    if (!this.pg) {
      this.createGraphics(p5);
      //console.log(this.graphics);
      //console.log(p5.createGraphics(100, 100).circle)
    }
    //this.graphics.circle(0, 0, 50);
    //p5.image(this.graphics, 0, 0);
    p5.background(50);
    p5.ellipse(100, 100, 20, 20);
    this.pg.background(100);
    this.pg.noStroke();
    this.pg.ellipse(this.pg.width / 2, this.pg.height / 2, 50, 50);
    p5.image(pg, 50, 50);
    p5.image(pg, 0, 0, 50, 50);
  }
}