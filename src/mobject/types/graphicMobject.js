import { ManimColor, WHITE } from "../../color/manimColor.js";
import { DEFAULT_LINE_WIDTH } from "../../constants.js";
import { Validation, defineUndef } from "../../utils/validation.js";
import { Mobject } from "../mobject.js";

class GMobject extends Mobject {
  /**
   * @param {{fillColor: ManimColor, strokeColor: ManimColor, strokeWeight: number, fillOpacity: number, strokeOpacity: number, width: number, height: number, name: string, dim: number, target: Mobject|null, zIndex: number}} kwargs 
   */
  constructor(kwargs) {
    super();
    
    if (Validation.isOfClass(this, "GMobject")) {
      this._init(kwargs);
    }
  }

  _init(kwargs) {
    this.fillColor = defineUndef(kwargs.fillColor, new ManimColor(WHITE));
    this.strokeColor = defineUndef(kwargs.strokeColor, new ManimColor(WHITE));
    this.strokeWidth = defineUndef(kwargs.lineWidth, DEFAULT_LINE_WIDTH);
    this.fillOpacity = defineUndef(kwargs.fillOpacity, 1.0);
    this.strokeOpacity = defineUndef(kwargs.strokeOpacity, 1.0);

    super._init(kwargs);
  }
}

export { GMobject };