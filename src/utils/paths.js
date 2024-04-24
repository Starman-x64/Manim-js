import { OUT } from "../mathConstants.js";
import { SpaceOps } from "./spaceOps.js";

class Paths {
  static clampEnds(start, end, alpha) {
    return alpha == 0 ? start.clone() : end.clone();
  }

  static straightPath() {
    return (start, end, alpha) => {
      console.log(start.toString());
      console.log(end.toString());
      return alpha == 0 || alpha == 1 ? Paths.clampEnds(start, end, alpha) :
    nj.add(nj.multiply(start, 1 - alpha), nj.multiply(end, alpha));}
  }

  static pathAlongCircles(arcAngle, circlesCenters, axis=OUT) {
    let unitAxis = nj.divide(axis, Math.sqrt(nj.multiply(axis, axis).selection.data.reduce((x,a)=>a+x)));
    
    let path = (startPoints, endPoints, alpha) => {
      console.log(startPoints.toString());
      console.log(circlesCenters.toString());
      let detransformedEndPoints = nj.add(circlesCenters, nj.dot(nj.subtract(endPoints, circlesCenters), SpaceOps.rotationMatrix(-arcAngle, unitAxis).T));
      let rotationMatrix = SpaceOps.rotationMatrix(alpha * arcAngle, unitAxis);
      console.log(Paths.straightPath()(startPoints, detransformedEndPoints, alpha).toString());
      console.log(rotationMatrix.toString());

      return nj.add(circlesCenters, nj.dot(nj.subtract(Paths.straightPath()(startPoints, detransformedEndPoints, alpha), circlesCenters), rotationMatrix.T));
    };

    return path;
  }
}

export { Paths };