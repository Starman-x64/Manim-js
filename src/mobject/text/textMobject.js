import { ManimColor, TRANSPARENT, WHITE } from "../../color/manimColor.js";
import { DEFAULT_FONT_SIZE } from "../../constants.js";
import { ORIGIN } from "../../math.js";
import { Validation, defineUndef } from "../../utils/validation.js";
import { GMobject } from "../types/graphicMobject.js";

class Text extends GMobject {
  constructor(text, kwargs={}) {
    super();
    
    if (Validation.isOfClass(this, "Text")) {
      this._init(text, kwargs);
    }
  }
  
  /**
   * Display non-LATEX text.
   */
  _init(text, kwargs) {
    this.lineSpacing = defineUndef(kwargs.lineSpacing, -1);
    this.font = defineUndef(kwargs.lineSpacing, "Monospace");
    this._fontSize = defineUndef(kwargs.fontSize, DEFAULT_FONT_SIZE);
    // this.slant = defineUndef(kwargs.slant, )
    // this.weight = 
    // this.gradient = 
    // this.tabWidth = 
    this.bold = defineUndef(kwargs.bold, false);
    this.italic = defineUndef(kwargs.italic, false);
    this.align = defineUndef(kwargs.align, TextAlign.AUTO);
    this.baseline = defineUndef(kwargs.baseline, TextBaseline.AUTO);

    this.originalText = text;
    let textWithoutTabs = text;
    this.text = textWithoutTabs;
    
    super._init(kwargs);

    this.color = defineUndef(kwargs.color, new ManimColor(WHITE));//, new ManimColor(kwargs.color));
    this.fillColor = defineUndef(kwargs.fillColor, new ManimColor(TRANSPARENT));//, new ManimColor(kwargs.color));
    this.strokeColor = defineUndef(kwargs.strokeColor, new ManimColor(TRANSPARENT));//, new ManimColor(kwargs.color));
  }
  
  generatePoints() {
    this.points = ORIGIN.clone(); 
  }

  getCenter() {
    return this.points.clone();
  }

  fontSize() {
    return this._fontSize;
  }

  getCanvasFontStyleString() {
    return `${this.bold ? "bold " : ""}${this.italic ? "italic " : ""}${this.fontSize()}px ${this.font}`;
  }
  
}

class TextAlign extends String {
  static AUTO = new TextAlign("start");
  static LEFT = new TextAlign("left");
  static RIGHT = new TextAlign("right");
  static CENTER = new TextAlign("center");
  static START = new TextAlign("start");
  static END = new TextAlign("end");
}

class TextBaseline extends String {
  static AUTO = new TextBaseline("middle"); // generally (as in in all js projects, including things unrelated to manim), the default value is alphabetic.
  static TOP = new TextBaseline("top");
  static HANGING = new TextBaseline("hanging");
  static MIDDLE = new TextBaseline("middle");
  static ALPHABETIC = new TextBaseline("alphabetic");
  static IDEOGRAPHIC = new TextBaseline("ideographic");
  static BOTTOM = new TextBaseline("bottom");
}

export { Text, TextAlign, TextBaseline };