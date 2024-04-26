import { Validation, defineUndef } from "../utils/validation.js";
import { ValidationError, ValueError } from "../error/errorClasses.js";

class ManimColorSpace extends String {
  static SRGB = new ManimColorSpace("SRGB");
  static LINEAR_RGB = new ManimColorSpace("linearRGB");
  static HSL = new ManimColorSpace("HSL");
  static HSV = new ManimColorSpace("HSV");
  static OKLAB = new ManimColorSpace("OKLAB");
  static OKLCH = new ManimColorSpace("OKLCH");
  static XYZ = new ManimColorSpace("XYZ");

  static REGISTERED_SPACES = [ManimColorSpace.SRGB, ManimColorSpace.LINEAR_RGB, ManimColorSpace.HSL, ManimColorSpace.HSV, ManimColorSpace.OKLAB, ManimColorSpace.OKLCH, ManimColorSpace.XYZ];
  
  static registerFormat(spaceString) {
    ManimColorSpace[spaceString.toUpperCase()] = spaceString.toUpperCase();
  }

  static isSpace(space) {
    return ManimColorSpace.REGISTERED_SPACES.includes(space);
  }
  
  get name() {
    return this.toLowerCase().toString();
  }
}

class ManimColorFormat extends String {
  static HEX = new ManimColorFormat("HEX_rep");
  static RGB = new ManimColorFormat("SRGB_rep");
  static SRGB = new ManimColorFormat("SRGB_rep");
  static LINEAR_RGB = new ManimColorFormat("linearRGB_rep");
  static HSL = new ManimColorFormat("HSL_rep");
  static HSV = new ManimColorFormat("HSV_rep");
  static OKLAB = new ManimColorFormat("OKLAB_rep");
  static OKLCH = new ManimColorFormat("OKLCH_rep");
  static XYZ = new ManimColorFormat("XYZ_rep");

  static REGISTERED_FORMATS = [ManimColorFormat.HEX, ManimColorFormat.RGB, ManimColorFormat.SRGB, ManimColorFormat.LINEAR_RGB, ManimColorFormat.HSL, ManimColorFormat.HSV, ManimColorFormat.OKLAB, ManimColorFormat.OKLCH, ManimColorFormat.XYZ];
  
  static registerFormat(formatString) {
    ManimColorFormat[formatString.toUpperCase()] = formatString.toUpperCase();
  }

  static isFormat(format) {
    return ManimColorFormat.REGISTERED_FORMATS.includes(format);
  }

  get name() {
    return this.split("_")[0].toLowerCase().toString();
  }
}



/**
 * Color object with conversions between different spaces.
 */
class ManimColor {
  constructor(...args) {
    this._rgb = [undefined, undefined, undefined];
    this._alpha = undefined;
    
    [this._rgb, this._alpha] = ManimColor._parseInput(...(ManimColor._validateInput(args)));
  }

  static VALID_MODES = ["hex", "rgb", "linearrgb", "hsl", "hsv", "oklab", "oklch", "xyz"];
  static MODE_SYNONYMS = { "srgb": "rgb" };
  static PATH_TO_XYZ = {
    "srgb": ["linearrgb", "sRGBToLinearRGB"],
    "linearrgb": ["xyz", "LinearRGBToXYZ"],
    "hsl": ["srgb", "HSLToRGB"],
    "hsv": ["srgb", "HSVToRGB"],
    "oklab": ["xyz", "OklabToXYZ"],
    "oklch": ["oklab", "OklchToOklab"],
    "xyz": ["xyz", ""]
  };
  static PATH_FROM_XYZ = {
    "srgb": ["linearrgb", "LinearRGBTosRGB"],
    "linearrgb": ["xyz", "XYZToLinearRGB"],
    "hsl": ["srgb", "RGBtoHSL"],
    "hsv": ["srgb", "RGBtoHSV"],
    "oklab": ["xyz", "XYZToOklab"],
    "oklch": ["oklab", "OklabToOklch"],
    "xyz": ["xyz", ""]
  };

  get alpha () { return this._alpha; }
  get alpha255 () { return Math.round(this.alpha * 255); }
  get rgb () { return [...(this._rgb)]; }
  get rgb255 () { return this.rgb.map(x => Math.round(x*255)); }
  get rgba () { return this.rgb.concat(this.alpha); }
  get rgba255 () { return this.rgb255.concat(this.alpha255); }
  get rgb255a () { return this.rgb255.concat(this.alpha); }
  get hex () { return "#" + this.rgb255.map(d => d.toString(16).padStart(2, "0")).join(""); }
  get hexa () { return "#" + this.rgba255.map(d => d.toString(16).padStart(2, "0")).join(""); }
  
  get srgb () { return this.rgb; }
  get xyz () { return ManimColor.sRGBToXYZ(this.rgb); }
  get linearrgb () { return ManimColor.sRGBToXYZ(this.rgb); }
  get hsl () { return ManimColor.RGBtoHSL(this.rgb); }
  get hsv () { return ManimColor.RGBtoHSV(this.rgb); }
  get oklab () { return ManimColor.XYZToOklab(this.xyz); }
  get oklch () { return ManimColor.OklabToOklch(this.oklab); }

  set alpha(newAlpha) {
    Validation.testNumberInRange({newAlpha}, 0, 1);
    this._alpha = newAlpha;
    return this;
  }

  toString(format=ManimColorFormat.RGB) {
    if (!ManimColorFormat.isFormat(format) && !ManimColorSpace.isSpace(format)) {
      throw new ValueError(`"${format}" is not a supported color format nor space!`);
    }
    if (format == ManimColorFormat.HEX) {
      return this.hex;
    }
    let formatName = format.name;
    let values = this[formatName].map(x => x.toFixed(3));
    return `${formatName}(${values.join(", ")}` + (this.alpha !== undefined ? " | " + (this.alpha * 100) + "%" : "") + ")";
  }
  
  /**
   * Return a color lerped between `this` and `color`.
   * @param {ManimColor} color The second color to interpolate to.
   * @param {number} t How far to interpolate (between 0 and 1)
   * @param {ManimColorSpace} space The color space to interpolate in. Default is `ManimColorSpace.OKLAB`.
   * @returns {ManimColor}
   */
  interpolate(color, t, space=ManimColorSpace.OKLAB) {
    if (!ManimColorSpace.isSpace(space)) {
      throw new ValueError(`Cannot interpolate in color space "${space}"!`);
    }
    let a = this[space.name];
    let b = color[space.name];
    let c = math.add(math.multiply(a, 1 - t), math.multiply(b, t));
    
    let alpha = this.alpha * (1 - t) + color.alpha * t;
    let rgba = ManimColor.convertColorBetweenSpaces(c, space, ManimColorSpace.SRGB).concat(alpha);
    let finalColor = new ManimColor(rgba);
    // console.log(rgba);

    /*console.log(
`Interpolating
${this.toString(ManimColorFormat.SRGB)} → ${color.toString(ManimColorFormat.SRGB)}
through color space ${space} with t = ${t}
${this.toString(space)} → ${color.toString(space)}.
Final Color: ${finalColor.toString(ManimColorSpace.SRGB)} (${finalColor.toString(space)})
%c█%c → %c█%c → %c█%c
`,
  `color: rgb(${this.rgb255[0]} ${this.rgb255[1]} ${this.rgb255[2]});`, `color: white;`,
  `color: rgb(${finalColor.rgb255[0]} ${finalColor.rgb255[1]} ${finalColor.rgb255[2]});`, `color: white;`,
  `color: rgb(${color.rgb255[0]} ${color.rgb255[1]} ${color.rgb255[2]});`, `color: white;`);*/
    
    return finalColor;
  }


  static _isValidColorSpace(space) {
    return (ManimColor.VALID_MODES.includes(space) || ManimColor.MODE_SYNONYMS[space] !== undefined) && space != "hex"
  }
  static convertColorBetweenSpaces(startColorArray, fromSpace, toSpace) {
    if (!ManimColorSpace.isSpace(toSpace)) throw new ValueError(`Cannot convert color to color space "${toSpace}"!`);
    if (!ManimColorSpace.isSpace(fromSpace) && fromSpace != "") throw new ValueError(`Cannot convert color to color space "${fromSpace}"!`);
    
    if (fromSpace == toSpace) return startColorArray;
    
    /** The path/tree of conversions to go from XYZ to the target. */
    let pathFromXYZ = [];
    let pathToXYZ = [];
    let currSpace = toSpace.toString().toLowerCase();
    let fSpace = fromSpace.toString().toLowerCase();
    let tSpace = toSpace.toString().toLowerCase();
    //console.log(`Want to convert color from "${fSpace}" to "${tSpace}".`);
    for (let i = 0; i < 100; i++) {
      if (currSpace == fSpace || currSpace == "xyz") break;
      pathFromXYZ.push(ManimColor.PATH_FROM_XYZ[currSpace]);
      currSpace = ManimColor.PATH_FROM_XYZ[currSpace][0];
    }
    currSpace = fSpace; 
    if (pathFromXYZ[pathFromXYZ.length - 1].includes("xyz")) {
      for (let i = 0; i < 100; i++) {
        if (currSpace == tSpace || currSpace == "xyz") break;
        pathToXYZ.push(ManimColor.PATH_TO_XYZ[currSpace]);
        currSpace = ManimColor.PATH_TO_XYZ[currSpace][0];
      }
    }
    pathFromXYZ.reverse();
    pathFromXYZ.push([tSpace, "end"]);
    let temp = pathToXYZ.map(x => x[0]);
    temp.reverse();
    temp.push(fSpace);
    temp.reverse();
    let path  = pathToXYZ.map((x,i) => [temp[i], x[1]]).concat(pathFromXYZ);
    //console.log(path.map(x => x[0] + " --(" + x[1] + ")-> ").join(""));
    let finalColor = [...startColorArray];
    path.forEach(step => {
      let func = ManimColor[step[1]];
      //console.log(step[1]);
      if (func !== undefined) finalColor = func(finalColor);
    });
    
    return finalColor;
  }

  /**Validate the input and return what kind of input it is so the parser doesn't need to do things twice.
   * 
   * @param {any[]} args Arguments passed to the constructor.
   * @returns {[inputMode: string, values: any[]]}
   */
  static _validateInput(args) {
    let inputMode = "";
    let values = [];
    // Can't make a colour with nothing given
    if(args.length == 0) {
      throw new ValidationError("No color given!");
    }
    // Could be a string (hex), an array, an ndarray, a single number in [0, 255] (gray), or a ManimColor
    else if(args.length == 1) {
      switch (args[0].constructor.name) {
        case "String":
          let hexRegex = /^#(?:([0-9A-Fa-f]{8})|([0-9A-Fa-f]{6})|([0-9A-Fa-f]{4})|([0-9A-Fa-f]{3}))$/g;
          if (!hexRegex.exec(args[0])) {
            throw new ValidationError(`"${args[0]}" is not a valid hex color!`);
          }
          inputMode = "hex";
          values = [args[0]];
          break;
        case "Array":
          inputMode = "rgb"
          if (args[0].length != 3 && args[0].length != 4) {
            throw new ValidationError(`RGB array "[${args[0]}]" must have 3 or 4 values.`);
          }
          let shouldWarn = false;
          args[0].forEach(v => {
            if(typeof v !== "number") {
              throw new ValidationError(`RGB array "[${args[0]}]" must only contain numbers.`);
            }
            if(v < 0 || v > 1) {
              shouldWarn = true;
            }
            values.push(Math.max(0, Math.min(v, 1)));
          });
          if (shouldWarn) {
            console.warn(`RGB array "[${args[0]}]" contain numbers out of the range [0,1]. These numbers will be clamped to "[${values}]"`);
          }
          break;
        case "Ndarray":
          inputMode = "rgb"
          if (args[0].shape != [3,1] && args[0].shape != [4,1] && args[0].shape != [1,3] && args[0].shape != [1,4]) {
            throw new ValidationError(`Ndarray must be a column (preferably)/row vector of length 3 or 4. Given Ndarray is of shape [${args[0].shape}].`);
          }
          values = args[0].flatten().selection.data;
          if (values.length != 3 && values.length != 4) {
            throw new EvalError(`Given Ndarray did not give 3 or 4 values. This probbably occurred because the given array was a result of Ndarray.pick(), as Ndarray.data still contains the data of the full array.`);
          }
          break;
        case "Number":
          inputMode = "gray";
          values = [Math.max(0, Math.min(args[0], 1))];
          if (args[0] < 0 || args[0] > 1) {
            console.warn(`Gray value must be in the range [0,1]. "${args[0]}" will be clamped to "${values[0]}".`);
          }
          break;
        case "ManimColor":
          inputMode = "manimcolor";
          values = args;
          break;
        default:
          throw new ValidationError(`Cannot determine colour from object of type "${args[0].constructor.name}".`);
      }
    }
    // Could be a colour space string and array/ndarray, but we'll just ignore for now
    else if(args.length == 2) {
      throw new ValidationError("Two inputs for colors (`space: string, values: Array | Ndarrray`) is not yet supported.");
    }
    // sRGB no alpha (rgb)
    else if(args.length == 3) {
      if (args.filter(v => typeof v !== "number").length != 0) {
        throw new ValidationError("RGB values must be numbers.");
      }
      inputMode = "rgb";
      values = args.map(v => Math.max(0, Math.min(v, 1)));
      if (args[0] < 0 || args[0] > 1) {
        console.warn(`RGB values must be in the range [0,1]. "${args}" will be clamped to "${values}".`);
      }
    }
    // sRGB with alpha (rgb) or a color space string and 3 numbers.
    else if(args.length == 4) {
      if (typeof args[0] == "string") {
        if (args.filter(v => typeof v !== "number").length != 1) throw new ValidationError("Color values must be numbers!");
        inputMode = args[0].toLowerCase(); // get the color space
        values = args.filter(v => typeof v === "number"); // get the 3 values
      }
      else if (args.filter(v => typeof v !== "number").length != 0) {
        throw new ValidationError("RGB values must be numbers.");
      }
      else {
        inputMode = "rgb";
        values = args.map(v => Math.max(0, Math.min(v, 1)));
        if (args[0] < 0 || args[0] > 1) {
          console.warn(`RGBA values must be in the range [0,1]. "${args}" will be clamped to "${values}".`);
        }
      }
    }
    // color space string and 3 numbers + 1 for alpha.
    else if(args.length == 5) {
      if (typeof args[0] !== "string") {
        throw new ValidationError("Color space must be a string!");
      }
      if (args.filter(v => typeof v !== "number").length != 1) {
        throw new ValidationError("Color values must be numbers!");
      }
      inputMode = args[0].toLowerCase(); // get the color space
      values = args.filter(v => typeof v === "number"); // get the 3 values
    }
    else {
      throw new ValidationError("Too many arguments passed into `new ManimColor()`!");
    }
    
    return [inputMode, values];
  }
  /**Parse the input validated and pre-processed `_validateInput()`.
   * 
   * @param {string} inputMode What kind of data in `args` is; e.g., `hex`, `ManimColor`, `rgb`, `xyz`, etc.
   * @param {any[]} args Arguments passed to the constructor.
   * @returns {string} Input mode.
   */
  static _parseInput(inputMode, args) {
    // take care of synonyms
    inputMode = inputMode == "srgb" ? "rgb" : inputMode;
    var [$0, $1, $2, $3] = args;
    $3 = $3 !== undefined ? $3 : 1;
    this._alpha = $3;
    switch (inputMode) { // manimcolor, hex, gray, rgb, linearrgb, hsl, hsv, oklab, oklch, xyz
      case "manimcolor":
        return [$0.rgb, $0.alpha];
      case "hex":
        let hexNumbers = $0.substring(1);
        let hexArray;
        let rgbDivisor;
        
        if (hexNumbers.length == 3) {
          hexArray = /(.)(.)(.)/g.exec();
          rgbDivisor = 15;
        }
        if (hexNumbers.length == 4) {
          hexArray = /(.)(.)(.)(.)/g.exec();
          rgbDivisor = 15;
        }
        if (hexNumbers.length == 6) {
          hexArray = /(..)(..)(..)/g.exec();
          rgbDivisor = 255;
        }
        else {
          hexArray = /(..)(..)(..)(..)/g.exec();
          rgbDivisor = 255;
        }
        hexArray.shift(); // get rid of the first element which will just be the input string
        let rgbArray = hexArray.map(v => parseInt(v, 16) / rgbDivisor);
        return [rgbArray, $3];
      case "gray":
        return [[[$0], [$0], [$0]], $3];
      case "rgb":
        return [[$0, $1, $2], $3];
      case "rgb255":
        //console.log([[$0/255, $1/255, $2/255], args[3] !== undefined ? $3/255 : 1]);
        return [[$0/255, $1/255, $2/255], args[3] !== undefined ? $3/255 : 1];
      case "linearrgb":
        return [ManimColor.LinearRGBTosRGB(nj.array([[$0], [$1], [$2]])).selection.data, $3];
      case "hsl":
        return [ManimColor.HSLToRGB(nj.array([[$0], [$1], [$2]])).selection.data, $3];
      case "hsv":
        return [ManimColor.HSVToRGB(nj.array([[$0], [$1], [$2]])).selection.data, $3];
      case "oklab":
        return [(ManimColor.OklabToXYZ(nj.array([[$0], [$1], [$2]]))).selection.data, $3];
      case "oklch":
        return [ManimColor.XYZTosRGB(ManimColor.OklabToXYZ(ManimColor.OklchToOklab(nj.array([[$0], [$1], [$2]])))).selection.data, $3];
      case "xyz":
        return [ManimColor.XYZTosRGB(nj.array([[$0], [$1], [$2]])).selection.data, $3];
      default:
        throw new ValueError(`Unsupported color space "${inputMode}".`);
    }
  }
  
  /** Linear RGBLinear RGB to CIE XYZ.
   * @type {Ndarray}
  */
  static LINEAR_RGB_TO_XYZ_MATRIX = math.matrix([
    [0.4124564,  0.3575761,  0.1804375],
    [0.2126729,  0.7151522,  0.0721750],
    [0.0193339,  0.1191920,  0.9503041],
  ]);
  /** CIE XYZ to Linear RGB.
   * @type {Ndarray}
  */
  static XYZ_TO_LINEAR_RGB = math.matrix([
    [ 3.2404542, -1.5371385, -0.4985314],
    [-0.9692660,  1.8760108,  0.0415560],
    [ 0.0556434, -0.2040259,  1.0572252],
  ]);
  /** CIE XYZ to LMS cone response.
   * @type {Ndarray}
  */
  static OKLAB_M1 = math.matrix([
    [ 0.8189330101,  0.3618667424, -0.1288597137],
    [ 0.0329845436,  0.9293118715,  0.0361456387],
    [ 0.0482003018,  0.2643662691,  0.6338517070]
  ]);
  /** LMS cone response to Oklab.
   * @type {Ndarray}
  */
  static OKLAB_M2 = math.matrix([
    [ 0.2104542553,  0.7936177850, -0.0040720468],
    [ 1.9779984951, -2.4285922050,  0.4505937099],
    [ 0.0259040371,  0.7827717662, -0.8086757660]
  ]);
  /** LMS cone response to XYZ.
   * @type {Ndarray}
  */
  static OKLAB_M1_INV = math.matrix([
    [ 1.22701385, -0.55779998,  0.28125615],
    [-0.04058018,  1.11225687, -0.07167668],
    [-0.07638128, -0.42148198,  1.58616322]
  ]);
  /** Oklab to LMS cone response.
   * @type {Ndarray}
  */
  static OKLAB_M2_INV = math.matrix([
    [ 1         ,  0.39633779,  0.21580376],
    [ 1.00000001, -0.10556134, -0.06385417],
    [ 1.00000005, -0.08948418, -1.29148554]
  ]);
  
  
  /**Convert from sRGB to Linear RGB.
   * 
   * @param {Number[]} rgb Array of sRGB values. `r,g,b ∈ [0,1]`
   * @returns {Number[]} Array of Linear RGB values. `r,g,b ∈ [0,1]`
   */
  static sRGBToLinearRGB(rgb) {
    const lin = (c) => c <= 0.04045 ? c / 12.92 : Math.pow(((c + 0.055) / 1.055), 2.4);
    return rgb.map(x => lin(x));
  }

  /**Convert from Linear RGB to sRGB.
   * 
   * @param {Number[]} rgb Array of Linear RGB values. `r,g,b ∈ [0,1]`
   * @returns {Number[]} Array of sRGB values. `r,g,b ∈ [0,1]`
   */
  static LinearRGBTosRGB(rgb) {
    const unlin = (c) => c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
    return rgb.map(x => unlin(x));
  }

  /**Convert from Linear RGB to CIE XYZ.
   * 
   * @param {Number[]} rgb Array of Linear RGB values. `r,g,b ∈ [0,1]`
   * @returns {Number[]} Array of XYZ values. `X,Y,Z ∈ ℝ`
   */
  static LinearRGBToXYZ(rgb) {
    return math.multiply(rgb, ManimColor.LINEAR_RGB_TO_XYZ_MATRIX)._data;
  }

  /**Convert from CIE XYZ to Linear RGB.
   * 
   * @param {Number[]} XYZ Array of XYZ values. `X,Y,Z ∈ ℝ`
   * @returns {Number[]} Array of Linear RGB values. `r,g,b ∈ [0,1]`
   */
  static XYZToLinearRGB(XYZ) {
    return math.multiply(XYZ, ManimColor.XYZ_TO_LINEAR_RGB)._data;
  }

  /**Convert from sRGB to CIE XYZ.
   * 
   * @param {Number[]} rgb Array of sRGB values. `r,g,b ∈ [0,1]`
   * @returns {Number[]} Array of XYZ values. `X,Y,Z ∈ ℝ`
   */
  static sRGBToXYZ(rgb) {
    return ManimColor.LinearRGBToXYZ(ManimColor.sRGBToLinearRGB(rgb));
  }

  /**Convert from CIE XYZ to sRGB.
   * 
   * @param {Number[]} XYZ Array of XYZ values. `X,Y,Z ∈ ℝ`
   * @returns {Number[]} Array of sRGB values. `r,g,b ∈ [0,1]`
   */
  static XYZTosRGB(XYZ) {
    return ManimColor.LinearRGBTosRGB(ManimColor.XYZToLinearRGB(XYZ));
  }
  
  /**Convert from Oklab to CIE XYZ.
   * 
   * @param {Number[]} Lab Array of Lab values. `L ∈ [0,1], a,b ∈ [-0.4,0.4]`
   * @returns {Number[]} Array of XYZ values. `X,Y,Z ∈ ℝ`
   */
  static OklabToXYZ(Lab) {
    let nonLinearResponse = math.multiply(Lab, ManimColor.OKLAB_M2_INV);
    let coneResponse = nonLinearResponse.map(x => math.pow(x, 3));
    return math.multiply(coneResponse, ManimColor.OKLAB_M1_INV)._data;
  }
  
  /**Convert from CIE XYZ to Oklab.
   * 
   * @param {Number[]} XYZ Array of XYZ values. `X,Y,Z ∈ ℝ`
   * @returns {Number[]} Array of Lab values. `L ∈ [0,1], a,b ∈ [-0.4,0.4]`
   */
  static XYZToOklab(XYZ) {
    let coneResponse = math.multiply(XYZ, ManimColor.OKLAB_M1);
    let nonLinearResponse = coneResponse.map(x => math.pow(x, 1/3));
    return math.multiply(nonLinearResponse, ManimColor.OKLAB_M2)._data;
  }
  
  /**Convert from Oklab to Oklch (lightness, chroma, hue).
   * 
   * @param {Number[]} Lab Array of Lab values. `L ∈ [0,1], a,b ∈ [-0.4,0.4]`
   * @returns {Number[]} Array of LCh values. `L ∈ [0,1], C ∈ [0,0.4], h ∈ [0, 360)`
   */
  static OklabToOklch(Lab) {
    let L = Lab[0];
    let a = Lab[1];
    let b = Lab[2];
    
    let C = Math.sqrt(a*a + b*b);
    let h = Math.atan2(b, a) * DEGREES;

    return [L, C, h];
  }
  
  /**Convert from Oklch to Oklab.
   * 
   * @param {Number[]} Lch Array of LCh values. `L ∈ [0,1], C ∈ [0,0.4], h ∈ [0, 360)`
   * @returns {Number[]} Array of Lab values. `L ∈ [0,1], a,b ∈ [-0.4,0.4]`
   */
  static OklchToOklab(Lch) {
    let L = Lch[0];
    let C = Lch[1];
    let h = Lch[2];
    
    let a = C * Math.cos(h * DEGREES);
    let b = C * Math.sin(h * DEGREES);

    return [L, a, b];
  }
  
  /**Convert from sRGB to HSV.
   * 
   * @param {Number[]} rgb Array of sRGB values. `r,g,b ∈ [0,1]`
   * @returns {Number[]} Array of HSV values. `H ∈ [0, 360), S,V ∈ [0,1]`
   */
  static RGBtoHSV(rgb) {
    let r = rgb.get(0, 0);
    let g = rgb.get(1, 0);
    let b = rgb.get(2, 0);
    
    let Xmin = Math.min(r, g, b);
    let V = Math.max(r, g, b);
    let C = V - Xmin;
    let H = C == 0 ? 0 : V == r ? 60 * (((g - b)/C) % 6) : V == g ? 60 * (((b - r)/C) + 2) : 60 * (((r - g)/C) + 4);
    let S = V == 0 ? 0 : C / V;

    return [H, S, V];
  }
  
  /**Convert from sRGB to HSL.
   * 
   * @param {Number[]} rgb Array of sRGB values. `r,g,b ∈ [0,1]`
   * @returns {Number[]} Array of HSL values. `H ∈ [0, 360), S,L ∈ [0,1]`
   */
  static RGBtoHSL(rgb) {
    let r = rgb.get(0, 0);
    let g = rgb.get(1, 0);
    let b = rgb.get(2, 0);

    let Xmin = Math.min(r, g, b);
    let V = Math.max(r, g, b);
    let C = V - Xmin;
    let L = (V + Xmin) / 2;
    let H = C == 0 ? 0 : V == r ? 60 * (((g - b)/C) % 6) : V == g ? 60 * (((b - r)/C) + 2) : 60 * (((r - g)/C) + 4);
    let S = L == 0 || L == 1 ? 0 : (v - L) / Math.min(L, 1-L);

    return [H, S, L];
  }
  
  /**Convert from HSV to sRGB.
   * 
   * @param {Number[]} HSV Array of HSV values. `H ∈ [0, 360), S,V ∈ [0,1]`
   * @returns {Number[]} Array of sRGB values. `r,g,b ∈ [0,1]`
   */
  static HSVToRGB(HSV) {
    let H = HSV.get(0, 0);
    let S = HSV.get(1, 0);
    let V = HSV.get(2, 0);

    let k = (n) =>  (n + H/60) % 6;

    let f = (n) => V - V * S * Math.max(0, Math.min(k(n), 4 - k(n), 1));

    return [f(5), f(3), f(1)];
  }
  
  /**Convert from HSL to sRGB.
   * 
   * @param {Number[]} HSL Array of HSL values. `H ∈ [0, 360), S,L ∈ [0,1]`
   * @returns {Number[]} Array of sRGB values. `r,g,b ∈ [0,1]`
   */
  static HSLToRGB(HSL) {
    let H = HSL.get(0, 0);
    let S = HSL.get(1, 0);
    let L = HSL.get(2, 0);

    let k = (n) =>  (n + H/30) % 12;
    let a = S * Math.min(L, 1 - L);

    let f = (n) => L - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));

    return [f(0), f(8), f(4)];
  }
}

const WHITE = new ManimColor("rgb255", 255, 255, 255);
const BLACK = new ManimColor("rgb255", 0, 0, 0);
const RED = new ManimColor("rgb255", 255, 77, 97);
const GREEN = new ManimColor("rgb255", 77, 217, 77);
const BLUE = new ManimColor("rgb255", 77, 177, 255);
const YELLOW = new ManimColor("rgb255", 247, 227, 47);
const ORANGE = new ManimColor("rgb255", 247, 137, 27);
const TRANSPARENT = new ManimColor("rgb255", 0, 0, 0, 0);
const DARK_RED = RED.interpolate(BLACK, 0.25);
const DARK_GREEN = GREEN.interpolate(BLACK, 0.25);
const DARK_BLUE = BLUE.interpolate(BLACK, 0.25);
const DARK_YELLOW = YELLOW.interpolate(BLACK, 0.25);
const DARK_ORANGE = ORANGE.interpolate(BLACK, 0.25);


export { ManimColor };
export { WHITE, BLACK, RED, GREEN, BLUE, YELLOW, ORANGE, TRANSPARENT, DARK_RED, DARK_GREEN, DARK_BLUE, DARK_YELLOW, DARK_ORANGE };