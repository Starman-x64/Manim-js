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
import { WHITE, TRANSPARENT, RED, DARK_RED, BLUE, DARK_BLUE, GREEN, DARK_GREEN, ORANGE } from "../src/color/manimColor.js";
import { Point3D } from "../src/point3d.js";
import { Curve } from "../src/mobject/geometry/curve.js";
import { LineDash } from "../src/mobject/types/vectorizedMobject.js";

class TestScene extends Scene {
  construct() {
    // let square = new Square({ strokeColor: DARK_BLUE, fillColor: BLUE });
    let targetShape = new Square({ drawBezierHandles: true, });//strokeColor: DARK_RED, fillColor: RED });
    let startPointMarker = new Circle({ radius: 0.25, lineWidth: 3, });
    let xAxis = new Line({ startPoint: Point3D(0, -100, 0), endPoint: Point3D(0, 100, 0), lineWidth: 3, strokeColor: RED, lineDash: LineDash.DASHED });
    let yAxis = new Line({ startPoint: Point3D(-100, 0, 0), endPoint: Point3D(100, 0, 0), lineWidth: 3, strokeColor: GREEN, });
    let pointFunctionPoint = new Point({});
    let proportionPoint = new Point({ fillColor: ORANGE });


    let n = 0;
    startPointMarker.shift(targetShape.getStartPointOfNthCurve(n));
    
    let curve = new Curve({ points: targetShape.getNthCurvePoints(n), curveTypes: [targetShape.getNthCurveType(n)], strokeColor: BLUE });
    console.log(targetShape.getNthCurveFunction(n)(0.5));
    pointFunctionPoint.shift(targetShape.getNthCurveFunction(n)(0.25));
    
    let alpha = 1;
    console.log(targetShape.pointFromProportion(alpha));
    proportionPoint.shift(targetShape.pointFromProportion(alpha));

    this.add(xAxis);
    this.add(yAxis);
    this.add(targetShape);
    this.add(curve);
    this.add(startPointMarker);
    this.add(pointFunctionPoint);
    this.add(proportionPoint);
  }
}

let scene = new TestScene(1080*0.75, 720*0.75);
scene.construct();
scene.run();