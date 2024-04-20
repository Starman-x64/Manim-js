import { Point3D } from "./point3d.js";

const PI = Math.PI;
const TAU = 2 * PI;

const UP = Point3D(0, 1, 0);
const DOWN = Point3D(0, -1, 0);
const RIGHT = Point3D(1, 0, 0);
const LEFT = Point3D(-1, 0, 0);

const UL = nj.add(UP, LEFT);
const UR = nj.add(UP, RIGHT);
const DL = nj.add(DOWN, LEFT);
const DR = nj.add(DOWN, RIGHT);
