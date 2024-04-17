import { VMobject } from "../types/vectorizedMobject.js";

class Square extends VMobject {
  constructor(kwargs) {
    super(kwargs);

    this.resetPoints();
    this.generatePoints();
    this.initColors();
  }
  generatePoints() {
    let hs = 100/2; // half the width/size/side length
    this.points = nj.array([[-hs, hs, hs, -hs, -hs],[hs, hs, -hs, -hs, hs],[0, 0, 0, 0, 0]]);
  }

}