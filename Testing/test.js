import { Scene } from "../src/scene/scene.js";
import { Square } from "../src/mobject/geometry/square.js";
import { Circle } from "../src/mobject/geometry/circle.js";
import { Point } from "../src/mobject/geometry/point.js";
import { Arrow, DashedLine, Line } from "../src/mobject/geometry/line.js";
import { Polygram } from "../src/mobject/geometry/polygram/polygram.js";
import { Polygon } from "../src/mobject/geometry/polygram/polygon.js";
import { RegularPolygon } from "../src/mobject/geometry/polygram/regularPolygon.js";
import { Triangle } from "../src/mobject/geometry/polygram/triangle.js";
import { Rectangle } from "../src/mobject/geometry/rectangle.js";
import { WHITE, TRANSPARENT, RED, DARK_RED, BLUE, DARK_BLUE, GREEN, DARK_GREEN, ORANGE, DARK_ORANGE } from "../src/color/manimColor.js";
import { Point3D } from "../src/point3d.js";
import { Curve } from "../src/mobject/geometry/curve.js";
import { LineDash } from "../src/mobject/types/vectorizedMobject.js";
import { ArrowTip } from "../src/mobject/geometry/tips/tip.js";
import { PI } from "../src/math.js";

class TestScene extends Scene {
  construct() {
    let line = new Line({ start: Point3D(-100, 0, 0), end: Point3D(100, 0, 0) });
    let dashedLine = new DashedLine(5, 0.5, { start: Point3D(-100, 1, 0), end: Point3D(100, 1, 0) });
    let dottedLine = new DashedLine(1, 0.1, { start: Point3D(-100, -1, 0), end: Point3D(100, -1, 0) });

    this.add(line);
    this.add(dashedLine);
    this.add(dottedLine);
  }
}

let scene = new TestScene(1080*0.75, 720*0.75);
scene.construct();
scene.run();