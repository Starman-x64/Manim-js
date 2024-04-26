import { Scene } from "../src/scene/scene.js";
import { Mobject, MobjectStyle } from "../src/mobject/mobject.js";
import { BLUE, RED, WHITE } from "../src/color/manimColor.js";
import { RIGHT } from "../src/mathConstants.js";
import { TextAlign, TextMobject } from "../src/mobject/text/textMobject.js";

class TestScene extends Scene {
  construct() {
    let mob1 = new Mobject({ fillColor: RED });
    mob1.points = [
      [-2, 2, 0],
      [-1, 2, 0], [1, 2, 0], [2, 2, 0],
      [2, 1, 0], [2, -1, 0], [2, -2, 0],
      [1, -2, 0], [-1, -2, 0], [-2, -2, 0],
      [-2, -1, 0], [-2, 1, 0], [-2, 2, 0]
    ];
    let mob2 = mob1.clone();
    let mob3 = mob1.clone();
    let mob4 = mob1.clone();
    mob2.shift([-1, 0.75, 0]);
    mob2.scale(0.2);
    mob2.fillColor = BLUE;

    mob3.shift([1, 0.75, 0]);
    mob3.scale(0.2);
    mob3.fillColor = BLUE;
    
    mob4.shift([0, -1, 0]);
    mob4.scale(0.2);
    mob4.width = 3;
    mob4.height = 0.5;
    mob4.fillColor = BLUE;
    
    mob1.add(mob2);
    mob1.add(mob3);
    mob1.add(mob4);
    
    this.add(mob1);
    
    let text = new TextMobject("Hello, world!", { align: TextAlign.CENTER });
    this.add(text);
    
    console.log(Mobject.MOBJECTS);
  }
}

let scene = new TestScene(1080*0.75, 720*0.75);
scene.construct();
scene.run();