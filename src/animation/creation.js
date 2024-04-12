/**Abstract class for Animations that show the GMobject partially.
 * @class
 * @constructor
 * @public
 */
class ShowPartial extends Animation {
  /**
   * @param {GMobject} mobject The GMobject to animate.
   * @param {{runTime: number, lagRatio: number, reverseRateFunction: boolean, name: string,  remover: boolean, introducer: boolean, suspendMobjectUpdating: boolean, rateFunc: Function, methods: {name: string, args: any[]}[]}} kwargs Keyword arguments.
   */
  constructor(mobject, kwargs={}) {
    kwargs.mobject = mobject;
    super(kwargs);
  }

  /**To be implemented by subclasses.
   * 
   * @param {number} alpha 
   */
  _getBounds(alpha) {
    throw new NotImplementedError("Please use Create or ShowPassingFlash");
  }
}

/**Incrementally show a GMobject.
 * 
 */
class Create extends ShowPartial {
  /**
   * @param {GMobject} mobject The GMobject to animate.
   * @param {{runTime: number, lagRatio: number, reverseRateFunction: boolean, name: string,  remover: boolean, introducer: boolean, suspendMobjectUpdating: boolean, rateFunc: Function, methods: {name: string, args: any[]}[]}} kwargs Keyword arguments.
   */
  constructor(mobject, kwargs={ lagRatio: 1.0, introducer: true }) {
    super(mobject, kwargs);
  }

  /**_getBounds
   * 
   * @param {number} alpha 
   * @returns {[start: 0, end: alpha]}
   */
  _getBounds(alpha) {
    return [0, alpha];
  }
}