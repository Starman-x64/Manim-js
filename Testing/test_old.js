

const TestScene00 = p => {
  let t = {
    
  };
  let tnr;
  p.preload = function() {
    tnr = p.loadFont('../lib/font/times.ttf');
  };
  p.setup = function () {
    setup2D(p);
    p.camera(0, 0, 50*p.sqrt(3), 0, 0, 0, 0, 1, 0);
    p.dragger = new Dragger(p, []);
    p.circ = new Circle({
      radius: 10,
    });
    p.circ.createGraphics(p);
  };
  p.draw = function () {
    p.background(0);
    p.dragger.show();
    p.rectMode(p.CENTER);
    //p.stroke(255, 0, 0);
    p.circ.show(p);
    //p.rect(0, 0, 50, 25);
    p.image(p.circ.graphics.createFramebuffer(), 0, 0);
  };
};


let p = new p5(TestScene00);