import { Scene } from "../src/scene/scene.js";
import { Square } from "../src/mobject/geometry/square.js";
import { Circle } from "../src/mobject/geometry/circle.js";
import { Point } from "../src/mobject/geometry/point.js";
import { WHITE, TRANSPARENT, RED, DARK_RED, BLUE, DARK_BLUE } from "../src/color/manimColor.js";

class TestScene extends Scene {
  construct() {
    let square = new Square({ size: 100, strokeColor: DARK_BLUE, fillColor: BLUE });
    let circle = new Circle({ radius: 50, strokeColor: DARK_RED, fillColor: RED });
    let point = new Point({ fillColor: WHITE });
    
    square.shift(nj.array([0,100,0]));
    
    this.add(square);
    this.add(circle);
    this.add(point);
  }
}

let scene = new TestScene(1080*0.75, 720*0.75);
scene.construct();
scene.run();