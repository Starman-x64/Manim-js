import { Scene } from "../src/scene/scene.js";
import { Mobject, MobjectStyle } from "../src/mobject/mobject.js";
import { RED, WHITE } from "../src/color/manimColor.js";

class TestScene extends Scene {
  construct() {
    let mob = new Mobject({ style: new MobjectStyle({ fillColor: RED })})
    mob.points = [
      [-2, 2, 0],
      [-1, 2, 0], [1, 2, 0], [2, 2, 0],
      [2, 1, 0], [2, -1, 0], [2, -2, 0],
      [1, -2, 0], [-1, -2, 0], [-2, -2, 0],
      [-2, -1, 0], [-2, 1, 0], [-2, 2, 0]
    ];
    mob.clone();
    this.add(mob);
    console.log(Mobject.MOBJECTS);
  }
}

let scene = new TestScene(1080*0.75, 720*0.75);
scene.construct();
scene.run();