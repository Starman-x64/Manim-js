
class Circle extends GraphicMobject {
  constructor(args) {
    super(args);
    this.radius = args.radius ? args.radius : 10;
    
    this.resetPoints();
    this.generatePoints();
  }
  generatePoints() {
    let n = 50;
    for(let i = 0; i < n; i++) {
      this.points.push(nj.array([this.radius * Math.cos(i / n * TAU), this.radius * Math.sin(i / n * TAU), 0]));
    }
  }
  show(p) {
    this.graphics.fill(...this.fillColor);
    this.graphics.stroke(...this.strokeColor);
    this.graphics.beginShape(p.TESS);
    this.points.forEach(point => this.graphics.vertex(point.get(0), point.get(1), point.get(2)));
    this.graphics.endShape(p.CLOSE);
  }
}