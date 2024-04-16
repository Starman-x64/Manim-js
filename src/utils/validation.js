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
}


export {defineUndef};