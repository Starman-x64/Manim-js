import { OUT } from "../mathConstants.js";

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

  /**
   * 
   * @param {number} angle 
   * @param {Ndarray} axis 
   */
  static rotationMatrix(angle, axis) {
    let sinHalfAngle = Math.sin(angle/2);
    let cosHalfAngle = Math.cos(angle/2);
    
    let rotationmatrix;
    
    if (axis == OUT) {
      let sinAngle = Math.sin(angle);
      let cosAngle = Math.cos(angle);
      return nj.array([
        [cosAngle, -sinAngle, 0],
        [sinAngle,  cosAngle, 0],
        [       0,         0, 1]
      ]);
    }
    let q0 = cosHalfAngle;
    let q1 =sinHalfAngle * axis.get(0,0);
    let q2 =sinHalfAngle * axis.get(0,1);
    let q3 =sinHalfAngle * axis.get(0,2);

    return nj.array([
      [1-2*q2*q2-q3*q3, 2*q1*q2-2*q0*q3, 2*q1*q3+2*q0*q2],
      [2*q1*q2+2*q0*q3, 1-2*q1*q1-q3*q3, 2*q2*q3-2*q0*q1],
      [2*q1*q3-2*q0*q2, 2*q2*q3+2*q0*q1, 1-2*q1*q1-q2*q2]
    ]);
  }
}

export { SpaceOps };