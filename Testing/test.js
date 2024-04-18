import { Scene } from "../src/scene/scene.js";
import { Square } from "../src/mobject/geometry/square.js";
import { Circle } from "../src/mobject/geometry/circle.js";
import { Point } from "../src/mobject/geometry/point.js";
import { Line } from "../src/mobject/geometry/line.js";
import { Polygram } from "../src/mobject/geometry/polygram/polygram.js";
import { Polygon } from "../src/mobject/geometry/polygram/polygon.js";
import { RegularPolygon } from "../src/mobject/geometry/polygram/regularPolygon.js";
import { Triangle } from "../src/mobject/geometry/polygram/triangle.js";
import { Rectangle } from "../src/mobject/geometry/polygram/rectangle.js";
import { WHITE, TRANSPARENT, RED, DARK_RED, BLUE, DARK_BLUE, GREEN, DARK_GREEN } from "../src/color/manimColor.js";
import { Point3D } from "../src/point3d.js";

class TestScene extends Scene {
  construct() {
    let square = new Square({ strokeColor: DARK_BLUE, fillColor: BLUE });
    let circle = new Circle({ radius: 0.5, strokeColor: DARK_RED, fillColor: RED });
    let point = new Point({ fillColor: WHITE });
    let line = new Line({ startPoint: Point3D(-2, 0, 0), endPoint: Point3D(-3, -2, 0), fillColor: GREEN });
    let polygram = new Polygram([
      [
        nj.array([[-50],[-30],[0]]),
        nj.array([[0],[50],[0]]),
        nj.array([[50],[-30],[0]]),
        nj.array([[-50],[-30],[0]])
      ], 
      [
        nj.array([[-50],[30],[0]]),
        nj.array([[0],[-50],[0]]),
        nj.array([[50],[30],[0]]),
        nj.array([[-50],[30],[0]])
      ]
    ], { fillColor: RED });
    let polygon = new Polygon([
      Point3D(-0.5, -0.3, 0),
      Point3D(0, 0.5, 0),
      Point3D(0.6, -0.6, 0),
      Point3D(-0.1, -0.2, 0),
    ]);
    let regularPolygon = new RegularPolygon(6, { fillColor: GREEN, strokeColor: DARK_GREEN });
    let triangle = new Triangle();
    let rectangle = new Rectangle();
    
    square.shift(Point3D(0, 2, 0));
    circle.shift(Point3D(2, 0, 0));
    point.shift(Point3D(-3, 0, 0));
    polygram.shift(Point3D(2, -2, 0));
    polygon.shift(Point3D(-2, -2, 0));
    
    this.add(square);
    this.add(circle);
    this.add(point);
    this.add(line);
    this.add(polygram);
    this.add(polygon);
    this.add(regularPolygon);
    this.add(triangle);
    this.add(rectangle);
  }
}

let scene = new TestScene(1080*0.75, 720*0.75);
scene.construct();
scene.run();