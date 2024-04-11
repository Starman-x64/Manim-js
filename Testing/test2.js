const s = ( p5 ) => {

  let x = 100;
  let y = 100;
  
  p5.setup = () => {
    p5.createCanvas(500, 500);
    pg = p5.createGraphics(100, 100);
  };

  p5.draw = () => {
    p5.background(200);
    pg.background(100);
    pg.noStroke();
    pg.ellipse(pg.width / 2, pg.height / 2, 50, 50);
    p5.image(pg, 50, 50);
    p5.image(pg, 0, 0, 50, 50);
  };
};

//new p5(s);

// class Square extends GraphicMobject {
  
// }

class TS extends Scene {
  
}

let sc = new TS();
sc.initialize();
sc.construct();
sc.runSketch();


class TestScene extends Scene {
  construct() {
    let square1 = new Square({ name: "Square 1" });
    //let square2 = new Square({ name: "Square 2" });
    this.add(square1);
    //this.add(square2);
    //square1.shift(nj.array([-50, 0, 0]));
    //square2.shift(nj.array([100, 0, 0]));
    //this.play(square1.animate().scale(1.1).shift(nj.array([50, 100, 0])));
    //this.play(square2.animate().shift(nj.array([50, 100, 0])));
  }
  setup(p5) {
    p5.createCanvas(400, 400);
  }

  draw(p5) {
    p5.background(0);
    //p5.fill(255);
    //p5.rect(100, 100, 50, 50);
    //p5.stroke(255);
    //p5.drawingContext.stroke(new Path2D("M 190 190 A 50 100 45 1 1 215,215"));
    //p5.drawingContext.fill(new Path2D("M 190 190 l 100 0 l 0 100 l -100 0 l 0 -100 Z"));
    //p5.drawingContext.stroke(new Path2D("M 100 100 L 200 100 L 200 200 L 100 200 Z"));
    //this.mobjects[0].shift(nj.array([1, 1, 0, 0]));
    super.draw(p5);
  }
}

//let scene = new TestScene();
//scene.initialize();
//scene.construct();
///scene.runSketch();