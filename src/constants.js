/******
 * Global variables / functions
 */

const WHITE = new ManimColor("rgb255", 255, 255, 255);
const BLACK = new ManimColor("rgb255", 0, 0, 0);
const RED = new ManimColor("rgb255", 255, 77, 97);
//console.log(RED);
const GREEN = new ManimColor("rgb255", 77, 217, 77);
const BLUE = new ManimColor("rgb255", 77, 177, 255);
const YELLOW = new ManimColor("rgb255", 247, 227, 47);
const ORANGE = new ManimColor("rgb255", 247, 137, 27);
const TRANSPARENT = new ManimColor("rgb255", 0, 0, 0, 0);
const DARK_RED = RED.interpolate(BLACK, 0.5, { space: "oklab" });
const DARK_GREEN = GREEN.interpolate(BLACK, 0.5, { space: "oklab" });
const DARK_BLUE = BLUE.interpolate(BLACK, 0.5, { space: "oklab" });
const DARK_YELLOW = YELLOW.interpolate(BLACK, 0.5, { space: "oklab" });
const DARK_ORANGE = ORANGE.interpolate(BLACK, 0.5, { space: "oklab" });



const DEFAULT_STROKE_WIDTH = 4;


