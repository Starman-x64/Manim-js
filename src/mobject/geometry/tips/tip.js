import { DEFAULT_ARROW_TIP_LENGTH } from "../../../constants.js";
import { NotImplementedError } from "../../../error/errorClasses.js";
import { PI } from "../../../math.js";
import { Validation, defineUndef } from "../../../utils/validation.js";
import { VMobject } from "../../types/vectorizedMobject.js";
import { Triangle } from "../polygram/triangle.js";




class ArrowTip extends VMobject {
  /** @inheritdoc */
  constructor(kwargs) {
    super();

    if (Validation.isOfClass(this, "ArrowTip")) {
      throw new NotImplementedError("`ArrowTip` constructor has to be implemented in inheriting subclasses.");
    }
  }

  _init(kwargs) {
    super._init(kwargs); 
  }
  
  /**
   * The base point of the `ArrowTip`.  
   * This is the point connecting to the arrow line.
   * @returns {Ndarray}
   */
  base() {
    return this.pointFromProportion(0.5);
  }

  /**
   * The tip point of the arrow tip.
   * @returns {Ndarray}
   */
  tipPoint() {
    return this.getPoint(0);
  }

  /**
   * The vector pointing from the base point to the tip point.
   * @returns {Ndarray}
   */
  vector() {
    return nj.subtract(this.tipPoint(), this.base());
  }

  /**
   * The angle of the arrow tip.
   * @returns {number}
   */
  tipAngle() {
    let vector = this.vector();
    return Math.atan2(vector.get(1, 0), vector.get(0, 0));
  }

  /**
   * The length of the arrow tip.
   * @returns {number}
   */
  length() {
    let vector = this.vector();
    return nj.sqrt(nj.dot(vector, vector)).selection.data[0];
  }

}

class ArrowTriangleTip extends ArrowTip {
  constructor(kwargs) {
    super();    

    // Don't initialise the mobject if this mobject is of a child class. Let the child class do it.
    if (Validation.isOfClass(this, "ArrowTriangleTip")) {
      this._init(kwargs);
    }
  }

  _init(kwargs) {
    /** @type {number} */
    let length = defineUndef(kwargs.length, DEFAULT_ARROW_TIP_LENGTH/2);
    /** @type {number} */
    let width = defineUndef(kwargs.width, DEFAULT_ARROW_TIP_LENGTH);
    /** @type {number} */
    let startAngle = defineUndef(kwargs.startAngle, PI);
    
    /** @type {number} */
    this.fillOpacity = defineUndef(kwargs.fillOpacity, 0);
    /** @type {number} */
    this.strokeWidth = defineUndef(kwargs.lineWidth, 3);

    this._tmp_genPointsArgs = {
      length: length,
      width: width,
      startAngle: startAngle
    }

    super._init(kwargs);
  }

  generatePoints() {
    let triangle = new Triangle({ fillOpacity: this.fillOpacity, lineWidth: this.strokeWidth, startAngle: this._tmp_genPointsArgs.startAngle });

    this.points = triangle.points.clone();
    this.curveTypes = structuredClone(triangle.curveTypes);
    this.stretchToFitWidth(this._tmp_genPointsArgs.width);
    this.stretchToFitHeight(this._tmp_genPointsArgs.length);
    delete this._tmp_genPointsArgs;
  }
}

class ArrowTriangleFilledTip extends ArrowTriangleTip {
  constructor(kwargs) {
    super();    

    // Don't initialise the mobject if this mobject is of a child class. Let the child class do it.
    if (Validation.isOfClass(this, "ArrowTriangleFilledTip")) {
      this._init(kwargs);
    }
  }
  
  _init(kwargs) {
    
    super._init(kwargs);
    
    this.fillColor = this.strokeColor;
    this.fillOpacity = 1;
  }
}

export { ArrowTip, ArrowTriangleTip, ArrowTriangleFilledTip };