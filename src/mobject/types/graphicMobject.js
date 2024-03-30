
class GraphicMobject extends Mobject {
  constructor(...args) {
    super(args);
    this.fillColor = args.fillColor ? args.fillColor : TRANSPARENT;
    this.strokeColor = args.strokeColor ? args.strokeColor : WHITE;
    this.width = args.width ? args.width : 100;
    this.height = args.height ? args.height : 100;
    this.p = args.p;
  }
  
  createGraphics(p) {
    this.p = p;
    this.graphics = p.createGraphics(this.width, this.height, p.WEBGL, p);
  }
  draw() {
    this.graphics.circle(0, 0, 50);
  }
}