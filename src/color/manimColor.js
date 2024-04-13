class ManimColor {
  constructor(...args) {
    this.space = {};
    this.xyz = [undefined, undefined, undefined];
    this.alpha;
    if(args.length == 0) {
      throw new ValueError("No color given!");
    }
    if(args.length == 1) {
      if (typeof args[0] == "string") {
        let regex = /^#(?:([0-9A-Fa-f]{8})|([0-9A-Fa-f]{6})|([0-9A-Fa-f]{4})|([0-9A-Fa-f]{3}))$/g;
        let matches = regex.exec(args[0]); 
        if (matches) {
          // let hex = matches.filter(m => m !== undefined);
          let hex = matches[0];
        }
      }
    }
    else {
      if (typeof args[0] == "string") {
        let values = args.filter((x, i) => i != 0);
        if (values.length < 3 || values.length > 4) {
          throw new ValueError("Must pass 3 or 4 values into ManimColor");
        }
        switch (args[0]) {
          case "rgb":
            break;
          case "srgb":
            break;
          case "rgba":
            break;
          case "srgba":
            ManimColor.sRGBToXYZ(...values);
            break;
          case "xyz":
            this.xyz = [values[0], values[1], values[2]]
            break;
          case "oklab":
            break;
          case "hsv":
            break;
          case "hsl":
            break;
          default:
            break;
        }
        if (values.length == 4) {
          this.alpha = values[3];
        }
      }
      else {
        if (args.length == 4) {
          this.alpha = args[3];
        }
        this.xyz = ManimColor.sRGBToXYZ(...args);
      }
    }
  }
  
  static LINEAR_RGB_TO_XYZ_MATRIX = nj.array([
    [0.4124, 0.3576, 0.1805],
    [0.2126, 0.7152, 0.0722],
    [0.0193, 0.1192, 0.9505]
  ]);
  
  /** XYZ to LMS cone response. */
  static OKLAB_M1 = nj.array([
    [ 0.8189330101,  0.3618667424, -0.1288597137],
    [ 0.0329845436,  0.9293118715,  0.0361456387],
    [ 0.0482003018,  0.2643662691,  0.6338517070]
  ]);
  /** LMS cone response to Oklab. */
  static OKLAB_M2 = nj.array([
    [ 0.2104542553,  0.7936177850, -0.0040720468],
    [ 1.9779984951, -2.4285922050,  0.4505937099],
    [ 0.0259040371,  0.7827717662, -0.8086757660]
  ]);
  /** LMS cone response to XYZ. */
  static OKLAB_M1_INV = nj.array([
    [ 1.22701385, -0.55779998,  0.28125615],
    [-0.04058018,  1.11225687, -0.07167668],
    [-0.07638128, -0.42148198,  1.58616322]
  ])
  /** Oklab to LMS cone response. */
  static OKLAB_M2_INV = nj.array([
    [ 1         ,  0.39633779,  0.21580376],
    [ 1.00000001, -0.10556134, -0.06385417],
    [ 1.00000005, -0.08948418, -1.29148554]
  ])
  
  /**Convert from sRGB to Linear RGB.
   * 
   * @param {NdArray} rgb 3x1 matrix of sRGB values. `r,g,b ∈ [0,1]`
   * @returns {NdArray} 3x1 matrix of Linear RGB values. `r,g,b ∈ [0,1]`
   */
  static sRGBToLinearRGB(rgb) {
    const lin = (c) => c <= 0.04045 ? c / 12.92 : Math.pow(((c + 0.055) / 1.055), 2,4);
    return nj.array([[lin(rgb.get(0, 0))], [lin(rgb.get(1, 0))], [lin(rgb.get(2, 0))]]);
  }

  /**Convert from sRGB to CIE XYZ.
   * 
   * @param {NdArray} rgb 3x1 matrix of sRGB values. `r,g,b ∈ [0,1]`
   * @returns {NdArray} 3x1 matrix of XYZ values. `X,Y,Z ∈ ℝ`
   */
  static sRGBToXYZ(rgb) {
    let linearRGB = nj.array(ManimColor.sRGBToLinearRGB(rgb)).reshape(3, 1);
    return nj.dot(ManimColor.LINEAR_RGB_TO_XYZ_MATRIX, linearRGB);
  }
  
  /**Convert from CIE XYZ to Oklab.
   * 
   * @param {NdArray} XYZ 3x1 matrix of XYZ values. `X,Y,Z ∈ ℝ`
   * @returns {NdArray} 3x1 matrix of Lab values. `L ∈ [0,1], a,b ∈ [-0.4,0.4]`
   */
  static XYZToOklab(XYZ) {
    let coneResponse = nj.dot(ManimColor.OKLAB_M1, XYZ);
    let nonLinearResponse = coneResponse.pow(nj.array([1/3, 1/3, 1/3]).reshape(3, 1));
    return nj.dot(ManimColor.OKLAB_M2, nonLinearResponse);
  }
  
  /**Convert from Oklab to CIE XYZ.
   * 
   * @param {NdArray} Lab 3x1 matrix of Lab values. `L ∈ [0,1], a,b ∈ [-0.4,0.4]`
   * @returns {NdArray} 3x1 matrix of XYZ values. `X,Y,Z ∈ ℝ`
   */
  static OklabToXYZ(Lab) {
    let nonLinearResponse = nj.dot(ManimColor.OKLAB_M2_INV, Lab);
    let coneResponse = nonLinearResponse.pow(nj.array([3, 3, 3]).reshape(3, 1));
    return nj.dot(ManimColor.OKLAB_M1_INV, coneResponse);
  }
  
  /**Convert from Oklab to Oklch (lightness, chroma, hue).
   * 
   * @param {NdArray} Lab 3x1 matrix of Lab values. `L ∈ [0,1], a,b ∈ [-0.4,0.4]`
   * @returns {NdArray} 3x1 matrix of LCh values. `L ∈ [0,1], C ∈ [0,0.4], h ∈ [0, 360)`
   */
  static OklabToOklch(Lab) {
    let L = Lab.get(0, 0);
    let a = Lab.get(1, 0);
    let b = Lab.get(2, 0);
    
    let C = Math.sqrt(a*a + b*b);
    let h = Math.atan2(b, a) * DEGREES;

    return nj.array([[L], [C], [h]]);
  }
  
  /**Convert from Oklch to Oklab.
   * 
   * @param {NdArray} Lch 3x1 matrix of LCh values. `L ∈ [0,1], C ∈ [0,0.4], h ∈ [0, 360)`
   * @returns {NdArray} 3x1 matrix of Lab values. `L ∈ [0,1], a,b ∈ [-0.4,0.4]`
   */
  static OklchToOklab(Lch) {
    let L = Lch.get(0, 0);
    let C = Lch.get(1, 0);
    let h = Lch.get(2, 0);
    
    let a = C * Math.cos(h * DEGREES);
    let b = C * Math.sin(h * DEGREES);

    return nj.array([[L], [a], [b]]);
  }
  
  /**Convert from sRGB to HSV.
   * 
   * @param {NdArray} rgb 3x1 matrix of sRGB values. `r,g,b ∈ [0,1]`
   * @returns {NdArray} 3x1 matrix of HSV values. `H ∈ [0, 360), S,V ∈ [0,1]`
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

    return nj.array([H], [S], [V]);
  }
  
  /**Convert from sRGB to HSL.
   * 
   * @param {NdArray} rgb 3x1 matrix of sRGB values. `r,g,b ∈ [0,1]`
   * @returns {NdArray} 3x1 matrix of HSL values. `H ∈ [0, 360), S,L ∈ [0,1]`
   */
  static RGBtoHSV(rgb) {
    let r = rgb.get(0, 0);
    let g = rgb.get(1, 0);
    let b = rgb.get(2, 0);

    let Xmin = Math.min(r, g, b);
    let V = Math.max(r, g, b);
    let C = V - Xmin;
    let L = (V + Xmin) / 2;
    let H = C == 0 ? 0 : V == r ? 60 * (((g - b)/C) % 6) : V == g ? 60 * (((b - r)/C) + 2) : 60 * (((r - g)/C) + 4);
    let S = L == 0 || L == 1 ? 0 : (v - L) / Math.min(L, 1-L);

    return nj.array([H], [S], [L]);
  }
  
  /**Convert from HSV to sRGB.
   * 
   * @param {NdArray} HSV 3x1 matrix of HSV values. `H ∈ [0, 360), S,V ∈ [0,1]`
   * @returns {NdArray} 3x1 matrix of sRGB values. `r,g,b ∈ [0,1]`
   */
  static HSVToRGB(HSV) {
    let H = HSV.get(0, 0);
    let S = HSV.get(1, 0);
    let V = HSV.get(2, 0);

    let k = (n) =>  (n + H/60) % 6;

    let f = (n) => V - V * S * Math.max(0, Math.min(k(n), 4 - k(n), 1));

    return nj.array([[f(5)], [f(3)], [f(1)]]);
  }
  
  /**Convert from HSL to sRGB.
   * 
   * @param {NdArray} HSL 3x1 matrix of HSL values. `H ∈ [0, 360), S,L ∈ [0,1]`
   * @returns {NdArray} 3x1 matrix of sRGB values. `r,g,b ∈ [0,1]`
   */
  static HSLToRGB(HSL) {
    let H = HSL.get(0, 0);
    let S = HSL.get(1, 0);
    let L = HSL.get(2, 0);

    let k = (n) =>  (n + H/30) % 12;
    let a = S * Math.min(L, 1 - L);

    let f = (n) => L - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));

    return nj.array([[f(0)], [f(8)], [f(4)]]);
  }
  // static HSLToRGB(HSL) {
  //   let H = HSL.get(0, 0);
  //   let S = HSL.get(1, 0);
  //   let L = HSL.get(2, 0);
  //   /** Chroma */
  //   let C = (1 - Math.abs(2*L - 1)) * S;
  //   let HPrime = H/60;
  //   /** Second largest component of the colour on one of the bottom 3 faces of the RGB cube with the same hue and chroma. */
  //   let X = C * (1 - Math.abs((HPrime % 2) - 1));
  //   let R = (0 <= HPrime && HPrime < 1) || (5 <= HPrime && HPrime < 6) ? C : (2 <= HPrime && HPrime < 4) ? 0 : X;
  //   let G = (1 <= HPrime && HPrime < 3) ? C : (5 <= HPrime && HPrime < 6) ? 0 : X;
  //   let B = (0 <= HPrime && HPrime < 2) ? 0 : (3 <= HPrime && HPrime < 5) ? C : X;
  //   let m = L - C / 2;
    
  //   return nd.array([[R + m], [G + m], [B + m]]);
  // }
}

console.log(new ManimColor(1, 1, 1, 1));