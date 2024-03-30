const s = ( sketch ) => {

  let x = 100;
  let y = 100;

  sketch.setup = () => {
    sketch.createCanvas(200, 200, sketch.SVG);
    console.log(sketch.SVG);
  };

  sketch.draw = () => {
    //sketch.background(0);
    sketch.fill(0);
    sketch.rect(x,y,50,50);
  };
};

let myp5 = new p5(s);