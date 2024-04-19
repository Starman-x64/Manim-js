import { Mobject } from "../mobject.js";
import { ManimColor } from "../../color/manimColor.js";
import { WHITE, BLACK, RED, GREEN, BLUE, YELLOW, ORANGE, TRANSPARENT, DARK_RED, DARK_GREEN, DARK_BLUE, DARK_YELLOW, DARK_ORANGE } from "../../color/manimColor.js";
import { defineUndef } from "../../utils/validation.js";
import { Validation } from "../../utils/validation.js";

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
    
    toleranceForPointEquality: 1e-6,
  }) {
    /**
     * @type {ManimColor}
     */
    super(kwargs);
    this.fillColor = defineUndef(kwargs.fillColor, TRANSPARENT);
    this.fillOpacity = defineUndef(kwargs.fillOpacity, 0.0);
    this.strokeColor = defineUndef(kwargs.strokeColor, WHITE);
    this.strokeOpacity = defineUndef(kwargs.strokeOpacity, 0.0);
    this.lineWidth = defineUndef(kwargs.lineWidth, DEFAULT_LINE_WIDTH);
    this.capStyle = defineUndef(kwargs.capStyle, CapStyleType.AUTO);
    this.jointType = defineUndef(kwargs.jointType, LineJoinType.AUTO);
    
    this.toleranceForPointEquality = defineUndef(kwargs.toleranceForPointEquality, 1e-6);
    
    /** 
     * SVG codes for what type of curve (line, quad/cubic bezier, moveTo, connectToStart) the sequence of `this.points` represents.
     * @type {string[]}
     * */
    this.curveTypes = []

  }
  
  width() {
    let xComponents = this.points.slice([0,1]).flatten();
    let currentWidth = xComponents.max() - xComponents.min();
    console.log(currentWidth);
    return currentWidth;
  }
  height() {
    let xComponents = this.points.slice([1,2]).flatten();
    let currentWidth = xComponents.max() - xComponents.min();
    console.log(currentWidth);
    return currentWidth;
  }
  
  scaleToFitWidth(widthToFit) {
    let xScaleFactor = widthToFit / this.width();
    let matrix = nj.array([
      [xScaleFactor, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ]);
    this.transformByMatrix(matrix);
  }
  scaleToFitHeight(heightToFit) {
    let yScaleFactor = heightToFit / this.height();
    let matrix = nj.array([
      [1, 0, 0],
      [0, yScaleFactor, 0],
      [0, 0, 1]
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

export { VMobject, CapStyleType, LineJoinType };