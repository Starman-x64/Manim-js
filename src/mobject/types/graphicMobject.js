
class GraphicMobject extends Mobject {
  constructor(...args) {
    super(args);
    this.fillColor = args.fillColor ? args.fillColor : TRANSPARENT;
    this.strokeColor = args.strokeColor ? args.strokeColor : WHITE;
    this.width = args.width ? args.width : 100;
    this.height = args.height ? args.height : 100;
  }
  
  createGraphics(p5) {
    this.graphics = p5.createGraphics(this.width, this.height, p5.WEBGL, p5);
  }
  draw(p5) {
    if (!this.graphics) {
      this.createGraphics(p5);
    }
    this.graphics.circle(0, 0, 50);
    p5.image(this.graphics, 0, 0);
  }
}