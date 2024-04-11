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

  constructor(
    fillColor=null,
    fillOpacity=0.0,
    strokeColor=null,
    strokeOpacity=1.0,
    strokeWidth=DEFAULT_STROKE_WIDTH,
    backgroundStrokeColor=BLACK,
    backgroundStrokeOpacity=1.0,
    backgroundStrokeWidth=0.0,
    sheenFactor=0.0,
    jointType=null,
    sheenDirection=UL,
    closeNewPoints=false,
    preFunctionHandleToAnchorScaleFactor=0.01,
    makeSmoothAfterApplyingFunctions=false,
    backgroundImage=null,
    shadeIn3d=false,
    // TODO, do we care about accounting for varying zoom levels?
    toleranceForPointEquality=1e-6,
    nPointsPerCubicCurve=4,
    capStyle="CapStyleType.AUTO" // shoudn't be a string.
  ) {
    this.fillOpacity = fillOpacity;
    this.strokeOpacity = strokeOpacity;
    this.strokeWidth = strokeWidth;
    if (backgroundStrokeColor) {
      this.backgroundStrokeColor = backgroundStrokeColor;
    }
    this.backgroundStrokeOpacity = backgroundStrokeOpacity;
    this.backgroundStrokeWidth = this.backgroundStrokeWidth;
    this.sheenFactor = sheenFactor;
    this.jointType = jointType | "LineJointType.AUTO";
    this.sheenDirection = sheenDirection;
    this.closeNewPoints = closeNewPoints;
    this.preFunctionHandleToAnchorScaleFactor = preFunctionHandleToAnchorScaleFactor;
    this.makeSmoothAfterApplyingFunctions = makeSmoothAfterApplyingFunctions;
    this.backgroundImage = backgroundImage;
    this.shadeIn3d = shadeIn3d;
    this.toleranceForPointEquality = toleranceForPointEquality;
    this.nPointsPerCubicCurve = nPointsPerCubicCurve;
    this.capStyle = capStyle;
    super();

    if (fillColor) self.fillColor = fillColor;
    if (strokeColor) self.strokeColor = strokeColor;
  }
  
  
}