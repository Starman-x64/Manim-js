/******
 * Global variables / functions
 */

const WHITE = new Color("rgb(255, 255, 255)");
const BLACK = new Color("rgb(0, 0, 0)");
const RED = new Color("rgb(255, 77, 97)");
const GREEN = new Color("rgb(77, 217, 77)");
const BLUE = new Color("rgb(77, 177, 255)");
const YELLOW = new Color("rgb(247, 227, 47)");
const ORANGE = new Color("rgb(247, 137, 27)");
const TRANSPARENT = new Color("rgb(0, 0, 0, 0)");
const DARK_RED = RED.range(BLACK, { space: "oklab", outputSpace: "srgb" })(0.5);
const DARK_GREEN = GREEN.range(BLACK, { space: "oklab", outputSpace: "srgb" })(0.5);
const DARK_BLUE = BLUE.range(BLACK, { space: "oklab", outputSpace: "srgb" })(0.5);
const DARK_YELLOW = YELLOW.range(BLACK, { space: "oklab", outputSpace: "srgb" })(0.5);
const DARK_ORANGE = ORANGE.range(BLACK, { space: "oklab", outputSpace: "srgb" })(0.5);

const PI = Math.PI;
const TAU = 2 * Math.PI;

/** `[0, 0, 0]`: The center of the coordinate system. */
const ORIGIN = nj.array(0.0, 0.0, 0.0);
/** `[0, 1, 0]`: One unit step in the positive Y direction. */
const UP = nj.array(0.0, 1.0, 0.0);
/** `[0, -1, 0]`: One unit step in the negative Y direction. */
const DOWN = nj.array(0.0, -1.0, 0.0);
/** `[1, 0, 0]`: One unit step in the positive X direction. */
const RIGHT = nj.array(1.0, 0.0, 0.0);
/** `[-1, 0, 0]`: One unit step in the negative X direction. */
const LEFT = nj.array(-1.0, 0.0, 0.0);
/** `[0, 0, 1]`: One unit step in the positive Z direction. */
const OUT = nj.array(0.0, 0.0, 1.0);
/** `[0, 0, -1]`: One unit step in the negative Z direction. */
const IN = nj.array(0.0, 0.0, -1.0);

/** `[1, 0, 0]`: Unit vector on the x-axis. */
const X_AXIS = nj.array(1.0, 0.0, 0.0);
/** `[0, 1, 0]`: Unit vector on the y-axis. */
const Y_AXIS = nj.array(0.0, 1.0, 0.0);
/** `[0, 0, 1]`: Unit vector on the z-axis. */
const Z_AXIS = nj.array(0.0, 0.0, 1.0);

/** `[-1, 1, 0]`: One step up plus one step left. */
const UL = nj.add(UP, LEFT);
/** `[1, 1, 0]`: One step up plus one step right. */
const UR = nj.add(UP, RIGHT);
/** `[-1, -1, 0]`: One step down plus one step left. */
const DL = nj.add(DOWN, LEFT);
/** `[1, -1, 0]`: One step down plus one step right. */
const DR = nj.add(DOWN, RIGHT);


const DEFAULT_STROKE_WIDTH = 4;


