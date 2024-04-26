import { ManimColor, TRANSPARENT, WHITE } from "../../color/manimColor.js";
import { DEFAULT_FONT_SIZE, DEFAULT_LINE_WIDTH } from "../../constants.js";
import { ORIGIN } from "../../mathConstants.js";
import { Validation, defineUndef } from "../../utils/validation.js";
import { Mobject, MobjectStyle } from "../mobject.js";

class TextMobject extends Mobject {
  constructor(text, kwargs={}) {
    super();
    
    if (Validation.isOfClass(this, "TextMobject")) {
      this._init(text, kwargs);
    }
  }
  
  /**
   * Display non-LATEX text.
   */
  _init(text, kwargs) {
    super._init(kwargs);
    // this.slant = defineUndef(kwargs.slant, )
    // this.weight = 
    // this.gradient = 
    // this.tabWidth = 

    this.originalText = text;
    let textWithoutTabs = text;
    this.text = textWithoutTabs;
  }

  initStyle(kwargs) {
    super.initStyle(kwargs);
    this.color = new ManimColor(defineUndef(kwargs.fillColor, WHITE));
    this.strokeColor = new ManimColor(defineUndef(kwargs.strokeColor, TRANSPARENT));
    
    this.typeface = defineUndef(kwargs.typeface, "Monospace");
    this.fontSize = defineUndef(kwargs.fontSize, DEFAULT_FONT_SIZE);
    this.bold = defineUndef(kwargs.bold, false);
    this.italic = defineUndef(kwargs.italic, false);
    
    this.lineSpacing = defineUndef(kwargs.lineSpacing, -1);
    this.align = defineUndef(kwargs.align, TextAlign.AUTO);
    this.baseline = defineUndef(kwargs.baseline, TextBaseline.AUTO);
  }
  
  generatePoints() {
    this.points = [[0, 0, 0]]; 
  }

  get font() { return `${this.bold ? "bold " : ""}${this.italic ? "italic " : ""}${this.fontSize}px ${this.typeface}`; }
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
  // Generally (as in in all JS projects, including things unrelated to Manim), the default value is "alphabetic".
  static AUTO = new TextBaseline("middle");
  static TOP = new TextBaseline("top");
  static HANGING = new TextBaseline("hanging");
  static MIDDLE = new TextBaseline("middle");
  static ALPHABETIC = new TextBaseline("alphabetic");
  static IDEOGRAPHIC = new TextBaseline("ideographic");
  static BOTTOM = new TextBaseline("bottom");
}

export { TextMobject, TextAlign, TextBaseline };