import { ValueError } from "../error/errorClasses.js";

/**
 * Shorthand for `value === undefined ? ifUndefined : ifDefined`   
 * If `ifDefined` is `null`, it will be replaced by `value`;
 * i.e., `value === undefined ? ifUndefined : value`
 * @param {any} value Value to check if undefined.
 * @param {any} ifUndefined Value to return if `value === undefined`.
 * @param {any | null} ifDefined Value to return if `value !== undefined`.
 * @returns {typeof ifUndefined | typeof ifDefined}
 */
const defineUndef = (value, ifUndefined, ifDefined=undefined) => {
  if (ifDefined === undefined) {
    return value === undefined ? ifUndefined : value;
  }
  return value === undefined ? ifUndefined : ifDefined;
};

const variableObjName = (variableObj) => {
  return Object.keys(variableObj)[0];
};
const variableObjValue = (variableObj) => {
  return variableObj[Object.keys(variableObj)[0]];
};



/**
 * Handles input validation.
 * Any values to test passed into `testXYZ` methods must be enclosed in `{curly braces}`.
 */
class Validation {
  /**
   * Validates a given numerical input between a certain (inclusive) range.  
   * If one of the bounds is `null`, then the number is not bounded on that side.
   * @param {{number: Number}} numberInCurlyBraces The number which should be within the given range.
   * @param {Number | null} min The minimum value `number` can be. If `null`, `number` has no lower bound.
   * @param {Number | null} max The maximum value `number` can be. If `null`, `number` has no upper bound.
   */
  static testNumberInRange(numberInCurlyBraces, min, max) {
    let name = variableObjName(numberInCurlyBraces);
    let value = variableObjValue(numberInCurlyBraces);
    if (!Validation.isNumber(value)) {
      throw new TypeError(`Expected a number, but "${value}" is a(n) ${value.constructor.name}!`);
    }
    if (!Validation.isNumber(min) && min !== null) {
      throw new TypeError(`The minimum value must be a number or null, not a(n) ${value.constructor.name}!`);
    }
    if (!Validation.isNumber(max) && max !== null) {
      throw new TypeError(`The maximum value must be a number or null, not a(n) ${value.constructor.name}!`);
    }
    if (min === null && max === null) {
      return;
    }
    if (min === null) {
      if (value > max) {
        throw new RangeError(`"${name}" must be greater than ${max}!`);
      }
      return;
    }
    if (max === null) {
      if (value < min) {
        throw new RangeError(`"${name}" must be less than ${min}!`);
      }
      return;
    }
    if (min > max) {
      throw new ValueError(`The minimum value must be smaller than the maximum!\n${min} < ${max} is false.`);
    }
    if (value < min || value > max) {
      throw new RangeError(`"${name}" must be within ${min} and ${max}!`);
    }
  }
  
  /**
   * Validates if the givern input is a number.  
   * @param {{number: Number}} numberInCurlyBraces The number which should be within the given range.
   */
  static testNumber(numberInCurlyBraces) {
    let name = variableObjName(numberInCurlyBraces);
    let value = variableObjValue(numberInCurlyBraces);
    if (!Validation.isNumber(value)) {
      throw new TypeError(`Expected a number, but "${value}" is a(n) ${value.constructor.name}!`);
      
    }
  }

  /**
   * Returns `typeof value == "number"`. 
   * @param {any} value The value to test.
   * @returns {Boolean}
   */
  static isNumber(value) {
    return typeof value == "number";
  }


  /**
   * Returns `typeof value == "string"`. 
   * @param {any} value The value to test.
   * @returns {Boolean}
   */
  static isString(value) {
    return typeof value == "string";
  }

  /**
   * Returns `value !== undefined`. 
   * @param {any} value The value to test.
   * @returns {Boolean}
   */
  static isDefined(value) {
    return !Validation.isUndefined(value);
  }
  
  /**
   * Returns `value === undefined`. 
   * @param {any} value The value to test.
   * @returns {Boolean}
   */
  static isUndefined(value) {
    return value === undefined;
  }

  /**
   * Returns `value.constructor.name == classInstance.name`.
   * @param {any} value The value to test.
   * @param {class} classInstance The class to test against.
   */
  static isOfClass(value, classInstance) {
    if (Validation.isString(classInstance)) {
      return value.constructor.name == classInstance;
    }
    if (classInstance) {
      if ("name" in classInstance) {
        return value.constructor.name == classInstance.name;
      }
    }
    throw new TypeError(`Class name to validate against must be a string, not a ${classInstance.constructor.name}!`);
  }

  
  /**
   * Returns `value instanceof class`.
   * @param {any} value The value to test.
   * @param {class} classInstance The name of the class to test against.
   */
  static isInstanceOf(value, classInstance) {
    return value instanceof classInstance;
  }
}




export { defineUndef };
export { Validation };