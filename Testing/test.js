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
import { Create } from "../src/animation/creation.js";
import { FadeIn, FadeOut } from "../src/animation/fading.js";
import { Rotate, Scale, Shift, Transform } from "../src/animation/transform.js";
import { Text } from "../src/mobject/text/textMobject.js";

class TestScene extends Scene {
  construct() {
    let line = new Line({ start: Point3D(-100, 0, 0), end: Point3D(100, 0, 0) });
    let dashedLine = new DashedLine(5, 0.5, { start: Point3D(-100, 1, 0), end: Point3D(100, 1, 0) });
    let dottedLine = new DashedLine(1, 0.1, { start: Point3D(-100, -1, 0), end: Point3D(100, -1, 0) });
    let square = new Square();
    let text =  new Text("Hello, world!");
    //let circle = new Circle({ radius: 2 });

    // circle.shift(Point3D(7, 0, 0));
    square.shift(Point3D(-5, 2, 0)).rotate(PI/4);

    //this.add(text);

    // this.add(line);
    // this.add(dashedLine);
    // this.add(dottedLine);
    // this.add(circle);
    this.play(FadeIn(text));
    this.play(FadeIn(square, { shiftVector: Point3D(0, -2, 0) }));
    this.play(Shift(square, Point3D(4, 0, 0)));
    this.play(Rotate(square, PI/6));
    this.play(Rotate(square, PI/4));
    this.play(Rotate(square, PI/3));
    this.play(Rotate(square, PI));
    this.play(Shift(square, Point3D(4, 0, 0)));
    this.play(Scale(square, 2));
    this.play(Transform(square, new Square({ fillColor: RED, strokeColor: DARK_RED, fillOpacity: 1 }))); 
    this.play(Transform(square, square.copy().set({ fillColor: GREEN, strokeColor: DARK_GREEN }))); 
    //this.play(square.animate().shift(Point3D(4, 0, 0)));
    this.play(FadeOut(square, { shiftVector: Point3D(0, -2, 0) }));

  }
}

let scene = new TestScene(1080*0.75, 720*0.75);
scene.construct();
scene.run();