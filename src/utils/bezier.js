import { Point3D } from "../point3d.js"

/**
 * Classic implementation of a bezier curve.
 * @param {Ndarray[]} points Points (`Point3D`) defining the desired bezier curve.
 * @returns {(t: number) => Ndarray} The function describing the bezier curve. Passing a `t` value between 0 and 1 will get the corresponding point on the curve.
 */
const bezier = (points) => {
  let numberOfPoints = points.length - 1;
  switch (numberOfPoints) {
    // Cubic
    case 3:
      return (t) => 
        nj.add(
          nj.add(
            nj.multiply(points[0], Math.pow(1 - t, 3)),
            nj.multiply(points[1], 3 * t * Math.pow(1 - t, 2))
          ),
          nj.add(
            nj.multiply(points[2], 3 * (1 - t) * Math.pow(t, 2)),
            nj.multiply(points[3], Math.pow(t, 3))
          )
        );
        // Quadratic
        case 2:
          return (t) => 
            nj.add(
              nj.add(
                nj.multiply(points[0], Math.pow(1 - t, 2)),
                nj.multiply(points[1], 2 * t * (1 - t))
              ),
              nj.multiply(points[2], Math.pow(t, 2))
            );
    // Linear (Line To) 
    case 1:
      return (t) => 
        nj.add(
          nj.multiply(points[0], 1 - t, ),
          nj.multiply(points[1], t)
        );
  }
}

export { bezier };