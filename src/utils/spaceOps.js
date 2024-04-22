
class SpaceOps {
  /**
   * 
   * @param {Ndarray} point 
   * @returns {[r: number, theta: number, phi: number]}
   */
  static cartesianToSpherical(point) {
    let x = point.get(0,0);
    let y = point.get(0,1);
    let z = point.get(0,2);

    let r = Math.sqrt(x*x + y*y + z*z);
    let theta = Math.atan2(y, x);
    let phi = Math.atan2(z, Math.sqrt(x*x + y*y));

    return [r, theta, phi];
  }
}

export { SpaceOps };