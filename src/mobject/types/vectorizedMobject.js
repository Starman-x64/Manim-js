import { Mobject } from "../mobject.js";
import { ManimColor } from "../../color/manimColor.js";
import { WHITE, BLACK, RED, GREEN, BLUE, YELLOW, ORANGE, TRANSPARENT, DARK_RED, DARK_GREEN, DARK_BLUE, DARK_YELLOW, DARK_ORANGE } from "../../color/manimColor.js";
import { defineUndef } from "../../utils/validation.js";

const DEFAULT_STROKE_WIDTH = 4;

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
  sheenFactor = 0.0;

  constructor(kwargs={
    fillColor: TRANSPARENT,
    fillOpacity: 0.0,
    strokeColor: WHITE,
    strokeOpacity: 0.0,
    strokeWidth: DEFAULT_STROKE_WIDTH,
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
    this.strokeWidth = defineUndef(kwargs.strokeWidth, DEFAULT_STROKE_WIDTH);
    this.capStyle = defineUndef(kwargs.capStyle, CapStyleType.AUTO);
    this.jointType = defineUndef(kwargs.jointType, LineJoinType.AUTO);
    
    this.toleranceForPointEquality = defineUndef(kwargs.toleranceForPointEquality, 1e-6);

  }
  
  
}

/**
 * Cap styles for setting `ctx.lineCap`.
 */
const CapStyleType = {
  /** Default value is `ROUND`.  */
  AUTO: "round",
  /** Ends flat exactly at the ending point. */
  BUTT: "butt",
  /** Ends with a semicircle with diameter of half the line width.  */
  ROUND: "round",
  /** Ends flat one half stroke width from the ending point. */
  SQUARE: "square"
}
/**
 * Line joining type for setting `ctx.lineJoin`.
 */
const LineJoinType = {
  /** Default value is `MITER`.  */
  AUTO: "miter",
  /** Sharp corners are flattened.  */
  BEVEL: "bevel",
  /** Rounded corners with radius equalling the line width */
  ROUND: "round",
  /** Miter joint. */
  MITER: "miter"
}

export { VMobject };