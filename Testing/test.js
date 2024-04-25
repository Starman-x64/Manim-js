import { Scene } from "../src/scene/scene.js";
import { Point3D } from "../src/point3d.js";
import { Mobject } from "../src/mobject/mobject.js";

class TestScene extends Scene {
  construct() {
    let mob = new Mobject();
    mob.points = [3, 2, 0];
    this.add(mob);
    console.log(Mobject.MOBJECTS);
  }
}

let scene = new TestScene(1080*0.75, 720*0.75);
scene.construct();
scene.run();