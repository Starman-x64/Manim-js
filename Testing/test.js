import { Scene } from "../src/scene/scene.js";
import { Point3D } from "../src/point3d.js";

class TestScene extends Scene {
  construct() {
    
  }
}

let scene = new TestScene(1080*0.75, 720*0.75);
scene.construct();
scene.run();