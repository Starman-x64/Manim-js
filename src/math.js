import { Point3D } from "./point3d.js";

const PI = Math.PI;
const TAU = 2 * Math.PI;
const DEGREES = 180 / PI;
const RADIANS = PI / 180;

/** `[0, 0, 0]`: The center of the coordinate system. */
const ORIGIN = Point3D(0.0, 0.0, 0.0);
/** `[0, 1, 0]`: One unit step in the positive Y direction. */
const UP = Point3D(0.0, 1.0, 0.0);
/** `[0, -1, 0]`: One unit step in the negative Y direction. */
const DOWN = Point3D(0.0, -1.0, 0.0);
/** `[1, 0, 0]`: One unit step in the positive X direction. */
const RIGHT = Point3D(1.0, 0.0, 0.0);
/** `[-1, 0, 0]`: One unit step in the negative X direction. */
const LEFT = Point3D(-1.0, 0.0, 0.0);
/** `[0, 0, 1]`: One unit step in the positive Z direction. */
const OUT = Point3D(0.0, 0.0, 1.0);
/** `[0, 0, -1]`: One unit step in the negative Z direction. */
const IN = Point3D(0.0, 0.0, -1.0);

/** `[1, 0, 0]`: Unit vector on the x-axis. */
const X_AXIS = Point3D(1.0, 0.0, 0.0);
/** `[0, 1, 0]`: Unit vector on the y-axis. */
const Y_AXIS = Point3D(0.0, 1.0, 0.0);
/** `[0, 0, 1]`: Unit vector on the z-axis. */
const Z_AXIS = Point3D(0.0, 0.0, 1.0);

/** `[-1, 1, 0]`: One step up plus one step left. */
const UL = nj.add(UP, LEFT);
/** `[1, 1, 0]`: One step up plus one step right. */
const UR = nj.add(UP, RIGHT);
/** `[-1, -1, 0]`: One step down plus one step left. */
const DL = nj.add(DOWN, LEFT);
/** `[1, -1, 0]`: One step down plus one step right. */
const DR = nj.add(DOWN, RIGHT);


export { PI, TAU, DEGREES, RADIANS };
export { ORIGIN, UP, DOWN, RIGHT, LEFT, OUT, IN, X_AXIS, Y_AXIS, Z_AXIS, UL, UR, DL, DR };