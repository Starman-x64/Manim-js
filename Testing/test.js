import { Scene } from "../src/scene/scene.js";
import { Square } from "../src/mobject/geometry/square.js";
import { Circle } from "../src/mobject/geometry/circle.js";
import { Point } from "../src/mobject/geometry/point.js";
import { Arrow, Line } from "../src/mobject/geometry/line.js";
import { Polygram } from "../src/mobject/geometry/polygram/polygram.js";
import { Polygon } from "../src/mobject/geometry/polygram/polygon.js";
import { RegularPolygon } from "../src/mobject/geometry/polygram/regularPolygon.js";
import { Triangle } from "../src/mobject/geometry/polygram/triangle.js";
import { Rectangle } from "../src/mobject/geometry/polygram/rectangle.js";
import { WHITE, TRANSPARENT, RED, DARK_RED, BLUE, DARK_BLUE, GREEN, DARK_GREEN, ORANGE, DARK_ORANGE } from "../src/color/manimColor.js";
import { Point3D } from "../src/point3d.js";
import { Curve } from "../src/mobject/geometry/curve.js";
import { LineDash } from "../src/mobject/types/vectorizedMobject.js";
import { ArrowTip } from "../src/mobject/geometry/tips/tip.js";
import { PI } from "../src/math.js";

class TestScene extends Scene {
  construct() {
    // let xAxis = new Line({ startPoint: Point3D(0, -100, 0), endPoint: Point3D(0, 100, 0), lineWidth: 3, strokeColor: RED, });
    // let yAxis = new Line({ startPoint: Point3D(-100, 0, 0), endPoint: Point3D(100, 0, 0), lineWidth: 3, strokeColor: GREEN, });
    // this.add(xAxis);
    // this.add(yAxis);
    
    let triangle = new Triangle();
    let square = new Square();
    let line = new Line({ end: Point3D(-1.5, -1.5, 0), start: Point3D(1, 1, 0) });
    let arrow2 = new Arrow({ end: Point3D(-1.5, -1.5, 0), start: Point3D(1, 1, 0) });
    let arrow = new Arrow({ strokeColor: ORANGE, start: Point3D(-1.5, -1.5, 0), end: Point3D(1, 1, 0) });
    let point1 = new Point({ fillColor: RED });
    let point2 = new Point({ fillColor: BLUE });
    
    square.rotate(PI/10).shift(Point3D(2, 2, 0));
    triangle/*.rotate(-PI/12)*/.shift(Point3D(-2, -2, 0));
    line.shift(Point3D(-0.25, 0.25, 0)).shift(Point3D(0.25, 0.25, 0));
    arrow.shift(Point3D(0.25, -0.25, 0)).shift(Point3D(0.25, 0.25, 0));
    point1.shift(arrow.tip.base());
    point2.shift(arrow.tip.tipPoint());

    this.add(triangle);
    this.add(square);
    this.add(line);
    this.add(arrow);
    this.add(arrow2);
    this.add(point1);
    this.add(point2);
  }
}

let scene = new TestScene(1080*0.75, 720*0.75);
scene.construct();
scene.run();