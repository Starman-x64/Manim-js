import { Mobject } from "../mobject.js";
import { ManimColor } from "../../color/manimColor.js";
import { WHITE, BLACK, RED, GREEN, BLUE, YELLOW, ORANGE, TRANSPARENT, DARK_RED, DARK_GREEN, DARK_BLUE, DARK_YELLOW, DARK_ORANGE } from "../../color/manimColor.js";
import { defineUndef } from "../../utils/validation.js";
import { Validation } from "../../utils/validation.js";
import { bezier } from "../../utils/bezier.js";
import { Point3D } from "../../point3d.js";
import { SVGDrawer } from "../../renderer/renderer2d.js";

const DEFAULT_LINE_WIDTH = 4;

/**A vectorized mobject.
 * 
 * @param {} backgroundStrokeColor The purpose of background stroke is to have something that won't overlap fill, e.g.  For text against some textured background.
 * @param {} sheenFactor When a color `c` is set, there will be a second color computed based on interpolating `c` to `WHITE` by with `sheenFactor`, and the display will gradient to this secondary color in the direction of `sheenDirection`.
 * @param {} closeNewPoints Indicates that it will not be displayed, but that it should count in parent mobject's path.
 * @param {} toleranceForPointEquality This is within a pixel.
 * @param {} jointType The line joint type used to connect the curve segments of this vectorized mobject. See `.LineJointType` for options.
 * 
 */
class VMobject extends Mobject {
  /**
   * @param {{fillColor: ManimColor, fillOpacity: number, strokeColor: ManimColor, strokeOpacity: number, lineWidth: number, capStyle: CapStyleType}} kwargs 
   */
  constructor(kwargs={
    fillColor: TRANSPARENT,
    fillOpacity: 0.0,
    strokeColor: WHITE,
    strokeOpacity: 0.0,
    lineWidth: DEFAULT_LINE_WIDTH,
    capStyle: CapStyleType.AUTO,
    lineDash: LineDash.SOLID,
    
    toleranceForPointEquality: 1e-6,

    drawBezierHandles: false,
  }) {
    /**
     * @type {ManimColor}
     */
    super(kwargs);
    
    /** @type {ManimColor} */
    this.fillColor = defineUndef(kwargs.fillColor, TRANSPARENT);
    /** @type {number} */
    this.fillOpacity = defineUndef(kwargs.fillOpacity, 0.0);
    /** @type {ManimColor} */
    this.strokeColor = defineUndef(kwargs.strokeColor, WHITE);
    /** @type {number} */
    this.strokeOpacity = defineUndef(kwargs.strokeOpacity, 0.0);
    /** @type {number} */
    this.strokeWidth = defineUndef(kwargs.lineWidth, DEFAULT_LINE_WIDTH);
    /** @type {CapStyleType} */
    this.capStyle = defineUndef(kwargs.capStyle, CapStyleType.AUTO);
    /** @type {LineJoinType} */
    this.jointType = defineUndef(kwargs.jointType, LineJoinType.AUTO);
    /** @type {LineDash} */
    this.lineDash = defineUndef(kwargs.lineDash, LineDash.SOLID);
    
    /** @type {number} */
    this.toleranceForPointEquality = defineUndef(kwargs.toleranceForPointEquality, 1e-6);
    
    /**
     * Whether or not the renderer should draw the bezier points and control points on top of the `Mobject`.
     * @type {boolean}
     */
    this.drawBezierHandles = defineUndef(kwargs.drawBezierHandles, false);
    
    /** 
     * SVG codes for what type of curve (line, quad/cubic bezier, moveTo, connectToStart) the sequence of `this.points` represents.
     * @type {string[]}
     * */
    this.curveTypes = []

  }
  
  /**
   * Get the width (x-dimension) of the `Mobject`.
   * @returns {number}
   */
  width() {
    let xComponents = this.points.slice([0,1]).flatten();
    let currentWidth = xComponents.max() - xComponents.min();
    return currentWidth;
  }

  /**
   * Get the height (y-dimension) of the `Mobject`.
   * @returns {number}
   */
  height() {
    let yComponents = this.points.slice([1,2]).flatten();
    let currentWidth = yComponents.max() - yComponents.min();
    return currentWidth;
  }

  /**
   * Get the depth (z-dimension) of the `Mobject`.
   * @returns {number}
   */
  depth() {
    let zComponents = this.points.slice([2,3]).flatten();
    let currentWidth = zComponents.max() - zComponents.min();
    return currentWidth;
  }
  
  /**
   * Scale the `Mobject` along the x-axis so it is the desired width.
   * @param {number} widthToFit The desired width.
   */
  stretchToFitWidth(widthToFit) {
    let xScaleFactor = widthToFit / this.width();
    let matrix = nj.array([
      [xScaleFactor, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ]);
    this.transformByMatrix(matrix);
  }
  
  /**
   * Scale the `Mobject` along the y-axis so it is the desired height.
   * @param {number} heightToFit The desired height.
   */
  stretchToFitHeight(heightToFit) {
    let yScaleFactor = heightToFit / this.height();
    let matrix = nj.array([
      [1, 0, 0],
      [0, yScaleFactor, 0],
      [0, 0, 1]
    ]);
    this.transformByMatrix(matrix);
  }
  
  /**
   * Scale the `Mobject` along the z-axis so it is the desired depth.
   * @param {number} depthToFit The desired depth.
   */
  stretchToFitDepth(depthToFit) {
    let zScaleFactor = depthToFit / this.height();
    let matrix = nj.array([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, zScaleFactor]
    ]);
    this.transformByMatrix(matrix);
  }
  
  /**
   * Gets the point at a specified proportion of the path of the `VMobject`.  
   * If the path of a `VMobject` was defined as some parametric 
   * function `f(t) -> (x, y)`, with 0 &le; t &le; 1, then the point returned
   * by this function would be `f(alpha)`. 
   * @param {number} alpha The proportion along the path of the `VMobject`.
   */
  pointFromProportion(alpha) {
    Validation.testNumberInRange({alpha}, 0, 1);
    this.throwErrorIfNoPoints();

    if (alpha == 1) {
      return this.points.slice([this.points.shape[0]-1,this.points.shape[0]]).flatten();
    }
    
    let curvesAndLengths = this.getCurveFunctionsWithLengths();
    /** @type {number} */
    let totalLength = curvesAndLengths.map(x => x[1]).reduce((x, a) => x + a);
    console.log(totalLength);
    /** @type {number} */
    let targetLength = alpha * totalLength;
    /** @type {number} */
    let currentLength = 0;
    
    console.log("targetLength", targetLength);
    for (let i = 0; i < curvesAndLengths.length; i++) {
      let [curve, length] = curvesAndLengths[i];
      console.log("currentLength", currentLength);
      if (currentLength + length >= targetLength) {
        let residue = 0;
        if (length != 0) {
          residue = (targetLength - currentLength) / length;
        }
        return curve(residue);
      }
      currentLength += length;
    }

    /*
      for curve, length in curves_and_lengths:
        if current_length + length >= target_length:
          if length != 0:
            residue = (target_length - current_length) / length
          else:
            residue = 0
          return curve(residue)
        current_length += length
    */
  }
  
  /**
   * 
   * @param {number} samplePoints The number of points to sample to find the length.
   */
  getCurveFunctionsWithLengths(samplePoints=10) {
    let numCurves = this.getNumCurves();
    let curvesAndLengths = [];
    for (let n = 0; n < numCurves; n++) {
      curvesAndLengths.push(this.getNthCurveFunctionWithLength(n, samplePoints));
    }
    return curvesAndLengths;
  }
  
  /**
   * Returns the parametric expression of the nth curve along with its (approximate) length.
   * @param {number} n The index of the desired curve.
   * @param {number} samplePoints The number of points to sample to find the length.
   * @returns {[curve: (number: t) => Ndarray, length: number]}
   */
  getNthCurveFunctionWithLength(n, samplePoints=10) {
    let curve = this.getNthCurveFunction(n);
    let norms = this.getNthCurveLengthPieces(n, samplePoints);
    let length = norms.reduce((a, x) => a + x);

    return [curve, length];
  }

  /**
   * Returns an array of points describing short line segments used for length approximation.
   * @param {number} n The index of the desired curve.
   * @param {number} samplePoints The number of points to sample to find the length.
   * @returns {number[]}
   */
  getNthCurveLengthPieces(n, samplePoints=10) {
    Validation.testNumberInRange({n}, 0, this.getNumCurves());
    Validation.testNumberInRange({samplePoints}, 2, null);

    let curveFunction = this.getNthCurveFunction(n);
    /* We use `samplePoints - 1` so we can include the endpoint as well.
     * Note this is not done in the original Manim, but length estimates are terribly off for even the simplest shapes
     * (e.g., for a square with side length 1, the perimeter returned would be $3.6$ with `samplePoints = 10`).
     */
    let points = Array(samplePoints-1).fill(0).map((_, a) => curveFunction(a/(samplePoints-1)));
    points[samplePoints - 1] = curveFunction(1);
    let differences = points
      .map((p, i) => i != samplePoints - 1 ? nj.subtract(p, points[i + 1]) : null)
      .filter(x => x !== null);
    let norms = differences.map(x => nj.sqrt(nj.dot(x, x)).get(0,0));
    return norms;
  }

  /**
   * Get a parametric function describing the nth curve of the `Mobject`.
   * @param {number} n The index of the curve whose function is to be returned.
   * @returns {(t: number) => Ndarray[]}
   */
  getNthCurveFunction(n) {
    let points = this.getNthCurvePoints(n);
    return bezier(points);
  }
  
  /**
   * Get the points of the nth curve of the `Mobject`.
   * @param {number} n The index of the curve whose points are to be gotten.
   * @returns {Ndarray[]}
   */
  getNthCurvePoints(n) {
    Validation.testNumberInRange({n}, 0, this.getNumCurves() - 1);
    let curveType = this.curveTypes.filter(x => x != "M")[n];
    let numPointsInCurve = curveType == SVGDrawer.CUBIC ? 4 : curveType === SVGDrawer.QUADRATIC ? 3 : curveType === SVGDrawer.LINE_TO ? 2 : -1;
    
    /** @type {number} */
    let startIndex = this.getIndexOfStartPointOfNthCurve(n);
    /** @type {Ndarray[]} */
    let pointsArray = [];
    for (let i = 0; i < numPointsInCurve; i++) {
      pointsArray.push(this.points.slice([startIndex + i, startIndex + i + 1]).flatten());
    }

    return pointsArray;
  }
  
  /**
   * Get the curve type (`Z`, `L`, `Q`, `C`) of the nth curve of the `Mobject`.
   * @param {number} n The index of the curve.
   * @returns {string}
   */
  getNthCurveType(n) {
    Validation.testNumberInRange({n}, 0, this.getNumCurves() - 1);
    return this.curveTypes.filter(x => x != "M")[n];
  }
  
  /**
   * Get the index of the first point in the nth curve of the `VMobject`.
   * @param {number} n The index of the nth curve (i.e., n) whose first point's index to get.
   * @returns {Ndarray}
   */
  getIndexOfStartPointOfNthCurve(n) {
    Validation.testNumberInRange({n}, 0, this.getNumCurves() - 1);

    /** @type {number} */
    let pointIndex =  0;
    /** @type {string[]} */
    let curveTypes = this.curveTypes.filter(x => x != "M");
    for(let i = 0; i < n; i++) {
      /** @type {string} */
      let curveType = curveTypes[i];
      switch (curveType) {
        case SVGDrawer.CUBIC:
          pointIndex += 3;
          break;
        case SVGDrawer.QUADRATIC:
          pointIndex += 2;
          break;
        case SVGDrawer.LINE_TO:
          pointIndex += 1;
          break;
        case SVGDrawer.CLOSE_PATH:
          pointIndex += 0;
          break;
      }
    }
    return pointIndex;
  }

  /**
   * Get the first point in the nth curve of the `VMobject`.
   * @param {number} n The index of the nth curve (i.e., n) whose first point to get.
   * @returns {Ndarray}
   */
  getStartPointOfNthCurve(n) {
    Validation.testNumberInRange({n}, 0, this.getNumCurves() - 1);
    return this.getNthPoint(this.getIndexOfStartPointOfNthCurve(n));
  }

  /**
   * Get the nth point of the `Mobject`.
   * @param {number} n The index of the point to retrieve.
   * @returns {Ndarray}
   */
  getNthPoint(n) {
    
    return this.points.slice([n,  n+1]).flatten();
  }

  /**
   * Returns the number of curves of the `VMobject`.
   * @returns {number}
   */
  getNumCurves() {
    return this.curveTypes.filter(x => x != SVGDrawer.MOVE_TO && x != SVGDrawer.CLOSE_PATH).length;
  }


}

/**
 * Cap styles for setting `ctx.lineCap`.
 */
class CapStyleType extends String {
  /** Default value is `ROUND`.  */
  static AUTO = new CapStyleType("round");
  /** Ends flat exactly at the ending point. */
  static BUTT = new CapStyleType("butt");
  /** Ends with a semicircle with diameter of half the line width.  */
  static ROUND = new CapStyleType("round");
  /** Ends flat one half stroke width from the ending point. */
  static SQUARE = new CapStyleType("square");
}

/**
 * Line joining type for setting `ctx.lineJoin`.
 */
class LineJoinType extends String {
  /** Default value is `MITER`.  */
  static AUTO = new LineJoinType("miter");
  /** Sharp corners are flattened.  */
  static BEVEL = new LineJoinType("bevel");
  /** Rounded corners with radius equalling the line width */
  static ROUND = new LineJoinType("round");
  /** Miter joint. */
  static MITER = new LineJoinType("miter");
}

class LineDash extends Array {
  /** Solid, unbroken line. */
  static SOLID = new LineDash(...[]);
  static DASHED = new LineDash(...[5,7.5]);
  static DOTTED = new LineDash(...[1,7.5]);
  static DOT_DASHED = new LineDash(...[5,7.5,1,7.5]);
}

export { VMobject, CapStyleType, LineJoinType, LineDash };