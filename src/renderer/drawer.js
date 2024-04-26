import { VMobject, CapStyleType, LineJoinType } from "../mobject/types/vectorizedMobject.js";
import {Scene} from "../scene/scene.js";
import { WHITE, BLACK, RED, GREEN, BLUE, YELLOW, ORANGE, TRANSPARENT, ManimColor } from "../color/manimColor.js";
import { bezier } from "../utils/bezier.js";
import { Validation, defineUndef } from "../utils/validation.js";
import { TextMobject } from "../mobject/text/textMobject.js";
import { Mobject, MobjectReference, MobjectStyle } from "../mobject/mobject.js";
import { Canvas, Canvas2D } from "./canvas.js";

/**
 * Generates a series of draw instructions from a given `Mobject`.
 */
class Drawer {
  /**
   * Generate a series of draw instructions from a given `Mobject`.  
   * The `Mobject` is handled by different `Drawer` subclassess, depending on what kind of `Mobject` the given one is.
   * @param {Mobject} ghostMobject The `Mobject` to generate instructions from.
   * @param {Canvas2D} canvas The `Canvas` to generate instructions for.
   * @returns {Function[]}
   */
  static generateDrawInstructions(ghostMobject, canvas) {
    let ghostMobjectClass = ghostMobject.constructor;
    if (ghostMobjectClass == TextMobject) { // TODO: in future, should be VMobject.
      return TextMobjectDrawer.generateDrawInstructions(ghostMobject, canvas);
    }
    if (ghostMobjectClass == Mobject) { // TODO: in future, should be VMobject.
      return VMobjectDrawer.generateDrawInstructions(ghostMobject, canvas);
    }
  }
  
  
  /** 
   * @param {{}}} style 
   * @param {Canvas2D} canvas 
   * @returns {(canvas: Canvas2D) => void}
   */
  static setStyle(style, canvas) {
    return [
      () => { canvas.fillStyle = style.fillStyle; },
      () => { canvas.strokeStyle = style.strokeStyle; },
      () => { canvas.lineWidth = style.lineWidth; },
      () => { canvas.lineSpacing = style.lineSpacing; },
      () => { canvas.textAlign = style.textAlign; },
      () => { canvas.textBaseline = style.textBaseline; },
      () => { canvas.font = style.font; },
    ];
  }
}

/**
 * Generates a series of draw instructions from a given `VMobject`.
 */
class VMobjectDrawer extends Drawer {
  /**
   * Ensure only instances inheriting from `VMobject` are passeed into the function.
   * @param {any} ghostMobject The ghost `Mobject` to validate.
   */
  static _validate(ghostMobject) {
    if (!Validation.inheritsFrom(ghostMobject, VMobject)) {
      throw new TypeError(`VMobjectDrawer can only Mobjects inheriting from VMobject, (which ${ghostMobject.constructor.name} does not)!`);
    }
  }
  
  /**
   * Generate a series of draw instructions from a given `Mobject`.  
   * The `Mobject` is handled by different `Drawer` subclassess, depending on what kind of `Mobject` the given one is.
   * @param {VMobject} ghostMobject The `VMobject` to generate instructions from.
   * @param {Canvas2D} canvas The `Canvas` to generate instructions for.
   * @returns {Function[]}
   */
  static generateDrawInstructions(ghostMobject, canvas) {
    // TODO: uncomment the following line when `VMobject`s are impelmented.
    // VMobjectDrawer._validate(ghostMobject);
    
    let drawInstructions = [];
    
    let style = {
      fillStyle: ghostMobject.fillColor,
      strokeStyle: ghostMobject.strokeColor,
      lineWidth: ghostMobject.lineWidth,
    };
    
    drawInstructions.push(...(Drawer.setStyle(style, canvas)));

    
    /** @type {Path2D} */
    let svgPath = VMobjectDrawer.generatePath2D(ghostMobject);
    
    drawInstructions.push(VMobjectDrawer.stroke(svgPath, canvas));
    drawInstructions.push(VMobjectDrawer.fill(svgPath, canvas));
    
    return drawInstructions;
  }
  
  /** 
   * @param {Path2D} point The `Path2D` to stroke.
   * @param {Canvas2D} canvas The `Canvas` to stroke onto.
   * @returns {() => void}
   */
  static stroke(path, canvas) {
    return () => { canvas.stroke(path); }
  }
  
  /** 
   * @param {Path2D} point The `Path2D` to stroke.
   * @param {Canvas2D} canvas The `Canvas` to stroke onto.
   * @returns {() => void}
   */
  static fill(path, canvas) {
    return () => { canvas.fill(path); }
  }

  /**
   * @param {VMobject} ghostMobject 
   */
  static generatePath2D(ghostMobject) {
    let points = ghostMobject._points;
    let string = "";
    
    for (let i = 0; i < points.length;) {
      if (i == 0) {
        string += `M ${points[i][0]} ${points[i][1]}`;
        i++;
      }
      else {
        string += ` C ${points[i][0]} ${points[i][1]} ${points[i+1][0]} ${points[i+1][1]} ${points[i+2][0]} ${points[i+2][1]}`;
        i += 3;
      }
    }
    
    let startEndDisplacement = math.subtract(points[0], points[points.length-1]);
    if (startEndDisplacement[0] == 0, startEndDisplacement[1] == 0) {
      string += " Z";
    }
    
    return new Path2D(string);
  }
}

/**
 * Generates a series of draw instructions from a given `TextMobject`.
 */
class TextMobjectDrawer extends Drawer {
  /**
   * Ensure only instances inheriting from `TextMobject` are passeed into the function.
   * @param {any} ghostMobject The ghost `Mobject` to validate.
   */
  static _validate(ghostMobject) {
    if (!Validation.inheritsFrom(ghostMobject, TextMobject)) {
      throw new TypeError(`TextMobjectDrawer can only Mobjects inheriting from TextMobject, (which ${ghostMobject.constructor.name} does not)!`);
    }
  }
  
  /**
   * Generate a series of draw instructions from a given `Mobject`.  
   * The `Mobject` is handled by different `Drawer` subclassess, depending on what kind of `Mobject` the given one is.
   * @param {TextMobject} ghostMobject The `TextMobject` to generate instructions from.
   * @param {Canvas2D} canvas The `Canvas` to generate instructions for.
   * @returns {Function[]}
   */
  static generateDrawInstructions(ghostMobject, canvas) {
    TextMobjectDrawer._validate(ghostMobject);
    
    let drawInstructions = [];
    
    let style = {
      fillStyle: ghostMobject.fillColor,
      strokeStyle: ghostMobject.strokeColor,
      lineWidth: ghostMobject.lineWidth,
      lineSpacing: ghostMobject.lineSpacing,
      textAlign: ghostMobject.align,
      textBaseline: ghostMobject.baseline,
      font: ghostMobject.font,
    };
    
    drawInstructions.push(...(Drawer.setStyle(style, canvas)));

    
    drawInstructions.push(TextMobjectDrawer.fillText(canvas, ghostMobject.text, ...(ghostMobject.center)));
    //drawInstructions.push(TextMobjectDrawer.strokeText(canvas, ghostMobject.text, ...(ghostMobject.center)));
    
    return drawInstructions;
  }
  
  /** 
   * @param {Canvas2D} canvas The `Canvas` to stroke onto.
   * @param {String} text The text to stroke.
   * @param {Number} x 
   * @param {Number} y 
   * @param {Number | undefined} maxWidth 
   * @returns {() => void}
   */
  static strokeText(canvas, text, x, y, maxWidth=undefined) {
    return () => { canvas.strokeText(text, x, y, maxWidth); }
  }
  
  /** 
   * @param {Canvas2D} canvas The `Canvas` to stroke onto.
   * @param {String} text The text to fill.
   * @param {Number} x 
   * @param {Number} y 
   * @param {Number | undefined} maxWidth 
   * @returns {() => void}
   */
  static fillText(canvas, text, x, y, maxWidth=undefined) {
    return () => { canvas.fillText(text, x, y, maxWidth); }
  }
}

/**
 * Interprets point positions and converts them into SVG path strings.
 */
class SVGDrawer {
  static QUADRATIC = "Q";
  static CUBIC = "C";
  static MOVE_TO = "M";
  static LINE_TO = "L";
  static CLOSE_PATH = "Z";
  
  /**
   * Converts the given points and point types into a valid `Path2D` object.
   * @param {number[][]} points The points of the shape.
   * @param {string[]} mobjectCurveTypes What type of (bezier) curves the given points correspond to.
   * @returns {Path2D}
   */
  static generatePath2D(points, mobjectCurveTypes) {
    /** @type {number} */
    let pointIndex = 0;
    /** @type {string[]} */
    let subPaths = [];
    let curveTypes = ["M"].concat(structuredClone(mobjectCurveTypes));
    // console.log(points);
    // console.log(curveTypes);
    curveTypes.forEach(curveType => {
      if (curveType == SVGDrawer.MOVE_TO) {
        subPaths.push(SVGDrawer.generateMoveToPath(points[pointIndex]));
        pointIndex++;
      }
      if (curveType == SVGDrawer.LINE_TO) {
        subPaths.push(SVGDrawer.generateLineToPath(points[pointIndex]));
        pointIndex++;
      }
      else if (curveType == SVGDrawer.QUADRATIC) {
        subPaths.push(SVGDrawer.generateQuadraticPath(points[pointIndex], points[pointIndex + 1]));
        pointIndex += 2;
      }
      else if (curveType == SVGDrawer.CUBIC) {
        subPaths.push(SVGDrawer.generateCubicPath(points[pointIndex], points[pointIndex + 1], points[pointIndex + 2]));
        pointIndex += 3;
      }
      else if (curveType == SVGDrawer.CLOSE_PATH) {
        subPaths.push("Z");
      }
    });
    
    let paths = { curve: new Path2D(subPaths.join(" ")), onPath: new Path2D(), quadratic: new Path2D(), cubic: new Path2D(), lines: new Path2D() };
    return paths;
  }
  
  /**
   * Generates debug graphics for a given set of points.  
   * - Draws points on the curve as `RED`
   * - Draws quadratic control points as `BLUE`
   * - Draws cubic control points as `GREEN`
   * @param {number[][]} points The points of the shape.
   * @param {string[]} mobjectCurveTypes What type of (bezier) curves the given points correspond to.
   * @returns {{onPath: Path2D, quadratic: Path2D, cubic: Path2D, lines: Path2D}}
   */
  static generateControlPointPath2D(points, mobjectCurveTypes) {
    /** @type {number} */
    let pointIndex = 0;
    /** @type {{curve: string[], onPath: string[], quadratic: string[], cubic: string[], lines: string[]}} */
    let subPaths = { curve: [], onPath: [], quadratic: [], cubic: [], lines: [] }; 
    /** @type {string[]} */
    let curveTypes = ["M"].concat(structuredClone(mobjectCurveTypes));
    /** @type {{onPath: number[][], quadratic: number[][], cubic: number[][]}} */
    let pointFamilies = { onPath: [], quadratic: [], cubic: [] };
    
    curveTypes.forEach(curveType => {
      if (curveType == SVGDrawer.MOVE_TO) {
        subPaths.curve.push(SVGDrawer.generateMoveToPath(points[pointIndex]));
        pointFamilies.onPath.push(points[pointIndex]);
        pointIndex++;
      }
      if (curveType == SVGDrawer.LINE_TO) {
        subPaths.curve.push(SVGDrawer.generateLineToPath(points[pointIndex]));
        pointFamilies.onPath.push(points[pointIndex]);
        pointIndex++;
      }
      else if (curveType == SVGDrawer.QUADRATIC) {
        subPaths.curve.push(SVGDrawer.generateQuadraticPath(points[pointIndex], points[pointIndex + 1]));
        subPaths.lines.push(SVGDrawer.generateMoveToPath(points[pointIndex - 1]));
        subPaths.lines.push(SVGDrawer.generateLineToPath(points[pointIndex]));
        subPaths.lines.push(SVGDrawer.generateLineToPath(points[pointIndex]));
        subPaths.lines.push(SVGDrawer.generateLineToPath(points[pointIndex + 1]));
        pointFamilies.quadratic.push(points[pointIndex]);
        pointFamilies.onPath.push(points[pointIndex + 1]);
        pointIndex += 2;
      }
      else if (curveType == SVGDrawer.CUBIC) {
        subPaths.curve.push(SVGDrawer.generateCubicPath(points[pointIndex], points[pointIndex + 1], points[pointIndex + 2]));
        subPaths.lines.push(SVGDrawer.generateMoveToPath(points[pointIndex - 1]));
        subPaths.lines.push(SVGDrawer.generateLineToPath(points[pointIndex]));
        subPaths.lines.push(SVGDrawer.generateMoveToPath(points[pointIndex + 1]));
        subPaths.lines.push(SVGDrawer.generateLineToPath(points[pointIndex + 2]));
        pointFamilies.cubic.push(points[pointIndex]);
        pointFamilies.cubic.push(points[pointIndex + 1]);
        pointFamilies.onPath.push(points[pointIndex + 2]);
        pointIndex += 3;
      }
      else if (curveType == SVGDrawer.CLOSE_PATH) {
        subPaths.curve.push("Z");
      }
    });
    
    /** @type {{onPath: Path2D, quadratic: Path2D, cubic: Path2D, lines: Path2D}} */
    let paths = { curve: new Path2D(subPaths.curve.join(" ")), onPath: new Path2D(), quadratic: new Path2D(), cubic: new Path2D(), lines: new Path2D(subPaths.lines.join(" ")) };

    const RADIUS = 5;
    
    pointFamilies.onPath.forEach(point => {
      paths.onPath.addPath(new Path2D(SVGDrawer.generateCircle(point, RADIUS)));
    });
    pointFamilies.quadratic.forEach(point => {
      paths.quadratic.addPath(new Path2D(SVGDrawer.generateCircle(point, RADIUS)));
    });
    pointFamilies.cubic.forEach(point => {
      paths.cubic.addPath(new Path2D(SVGDrawer.generateCircle(point, RADIUS)));
    });

    
    return paths;
  }
  
  /**
   * Generates a valid SVG string for a circle composed of two arcs.  
   * Note that this is only used for making circles in `SVGDrawer.generateControlPointPath2D()`.
   * @param {number[]} position Position of the centre of the circle.
   * @param {number} radius Radius of the circle.
   * @returns {string}
   */
  static generateCircle(position, radius) {
    let centreX = position[0];
    let centreY = position[1];
    return `M ${centreX - radius} ${centreY} a ${radius} ${radius} 0 1 0 ${2 * radius} 0  a ${radius} ${radius} 0 1 0 -${2 * radius} 0`;
  }

  /**
   * Generates the string `"M <xPosition> <yPosition>"`.
   * @param {number[]} position Position to move to.
   * @returns {string}
   */
  static generateMoveToPath(position) {
    return `M ${position[0]} ${position[1]}`;
  }

  /**
   * Generates the string `"L <p2XPosition> <p2YPosition>"`.
   * @param {number[]} endPoint End point of the line.
   * @returns {string}
   */
  static generateLineToPath(endPoint) {
    return `L ${endPoint[0]} ${endPoint[1]}`;
  }

  /**
   * Generates the string `"Q <cXPosition> <cYPosition> <p2XPosition> <p2YPosition>"`.
   * @param {number[]} endPoint p2 of the bezier curve.
   * @param {number[]} controlPoint Position of the control point.
   * @returns {string}
   */
  static generateQuadraticPath(controlPoint, endPoint) {
    return `Q ${controlPoint[0]} ${controlPoint[1]} ${endPoint[0]} ${endPoint[1]}`;
  }

  /**
   * Generates the string `"C <c1XPosition> <c1YPosition> <c2XPosition> <c2YPosition> <p2XPosition> <p2YPosition>"`.
   * @param {number[]} endPoint p2 of the bezier curve.
   * @param {number[]} controlPoint1 Position of the control point near the start of the curve..
   * @param {number[]} controlPoint2 Position of the control point near the end of the curve..
   * @returns {string}
   */
  static generateCubicPath(controlPoint1, controlPoint2, endPoint) {
    return `C ${controlPoint1[0]} ${controlPoint1[1]} ${controlPoint2[0]} ${controlPoint2[1]} ${endPoint[0]} ${endPoint[1]}`;
  }
}

export { Drawer, VMobjectDrawer, SVGDrawer };