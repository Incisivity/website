// Color conversion utilities based on research findings

// CIE 1931 color matching functions (X, Y, Z) for wavelength to RGB conversion
// These arrays represent the standard observer color matching functions
const CIE_X = [
  0.000160, 0.000662, 0.002362, 0.007242, 0.019110, 0.043400, 0.084736, 0.140638,
  0.204492, 0.264737, 0.314679, 0.357719, 0.383734, 0.386726, 0.370702, 0.342957,
  0.302273, 0.254085, 0.195618, 0.132349, 0.080507, 0.041072, 0.016172, 0.005132,
  0.003816, 0.015444, 0.037465, 0.071358, 0.117749, 0.172953, 0.236491, 0.304213,
  0.376772, 0.451584, 0.529826, 0.616053, 0.705224, 0.793832, 0.878655, 0.951162,
  1.014160, 1.074300, 1.118520, 1.134300, 1.123990, 1.089100, 1.030480, 0.950740,
  0.856297, 0.754930, 0.647467, 0.535110, 0.431567, 0.343690, 0.268329, 0.204300,
  0.152568, 0.112210, 0.081261, 0.057930, 0.040851, 0.028623, 0.019941, 0.013842,
  0.009577, 0.006605, 0.004553, 0.003145, 0.002175, 0.001506, 0.001045, 0.000727,
  0.000508, 0.000356, 0.000251, 0.000178, 0.000126, 0.000090, 0.000065, 0.000046,
  0.000033
]

const CIE_Y = [
  0.000017, 0.000072, 0.000253, 0.000769, 0.002004, 0.004509, 0.008756, 0.014456,
  0.021391, 0.029497, 0.038676, 0.049602, 0.062077, 0.074704, 0.089456, 0.106256,
  0.128201, 0.152761, 0.185190, 0.219940, 0.253589, 0.297665, 0.339133, 0.395379,
  0.460777, 0.531360, 0.606741, 0.685660, 0.761757, 0.823330, 0.875211, 0.923810,
  0.961988, 0.982200, 0.991761, 0.999110, 0.997340, 0.982380, 0.955552, 0.915175,
  0.868934, 0.825623, 0.777405, 0.720353, 0.658341, 0.593878, 0.527963, 0.461834,
  0.398057, 0.339554, 0.283493, 0.228254, 0.179828, 0.140211, 0.107633, 0.081187,
  0.060281, 0.044096, 0.031800, 0.022602, 0.015905, 0.011130, 0.007749, 0.005375,
  0.003718, 0.002565, 0.001768, 0.001222, 0.000846, 0.000586, 0.000407, 0.000284,
  0.000199, 0.000140, 0.000098, 0.000070, 0.000050, 0.000036, 0.000025, 0.000018,
  0.000013
]

const CIE_Z = [
  0.000705, 0.002928, 0.010482, 0.032344, 0.086011, 0.197120, 0.389366, 0.656760,
  0.972542, 1.282500, 1.553480, 1.798500, 1.967280, 2.027300, 1.994800, 1.900700,
  1.745370, 1.554900, 1.317560, 1.030200, 0.772125, 0.570060, 0.415254, 0.302356,
  0.218502, 0.159249, 0.112044, 0.082248, 0.060709, 0.043050, 0.030451, 0.020584,
  0.013676, 0.007918, 0.003988, 0.001091, 0.000000, 0.000000, 0.000000, 0.000000,
  0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000,
  0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000,
  0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000,
  0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000,
  0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000,
  0.000000
]

// sRGB transformation matrix for XYZ to RGB conversion
const MATRIX_SRGB_D65 = [
  3.2404542, -1.5371385, -0.4985314,
  -0.9692660, 1.8760108, 0.0415560,
  0.0556434, -0.2040259, 1.0572252
]

const WAVELENGTH_MIN = 380 // nm
const WAVELENGTH_MAX = 780 // nm
const WAVELENGTH_STEP = 5 // nm

export class ColorConverter {
  // Convert audio frequency to light wavelength using the 40-octave relationship
  static frequencyToWavelength(audioFrequency) {
    // Speed of light in nm/s
    const SPEED_OF_LIGHT = 299792458 * 1e9
    
    // Convert audio frequency to light frequency (40 octaves up)
    // Using a more practical mapping for visible spectrum
    const lightFrequency = audioFrequency * Math.pow(2, 40)
    
    // Calculate wavelength
    let wavelength = SPEED_OF_LIGHT / lightFrequency
    
    // If the calculated wavelength is outside visible spectrum, map it proportionally
    if (wavelength < WAVELENGTH_MIN || wavelength > WAVELENGTH_MAX) {
      // Map audio frequency range (80-1000 Hz) to visible spectrum (380-780 nm)
      const minAudioFreq = 80
      const maxAudioFreq = 1000
      
      // Clamp frequency to expected range
      const clampedFreq = Math.max(minAudioFreq, Math.min(maxAudioFreq, audioFrequency))
      
      // Linear mapping to visible spectrum
      const ratio = (clampedFreq - minAudioFreq) / (maxAudioFreq - minAudioFreq)
      wavelength = WAVELENGTH_MIN + ratio * (WAVELENGTH_MAX - WAVELENGTH_MIN)
    }
    
    return Math.max(WAVELENGTH_MIN, Math.min(WAVELENGTH_MAX, wavelength))
  }

  // Alternative frequency to color mapping using HSL
  static frequencyToHSL(frequency, amplitude = 1.0) {
    // Map frequency range to hue (0-360)
    const minFreq = 80  // Typical low voice frequency
    const maxFreq = 1000  // Typical high voice frequency
    
    // Clamp frequency to expected range
    const clampedFreq = Math.max(minFreq, Math.min(maxFreq, frequency))
    
    // Map to hue with some color theory considerations
    // Low frequencies -> red/orange (0-60)
    // Mid frequencies -> yellow/green (60-180)
    // High frequencies -> blue/purple (180-300)
    const ratio = (clampedFreq - minFreq) / (maxFreq - minFreq)
    const hue = ratio * 300 // 0 to 300 degrees
    
    // Saturation based on amplitude (higher amplitude = more saturated)
    const saturation = Math.max(30, Math.min(90, 30 + amplitude * 60))
    
    // Lightness varies slightly with frequency for visual interest
    const lightness = 45 + Math.sin(ratio * Math.PI) * 15 // 30-60%
    
    return { h: hue, s: saturation, l: lightness }
  }

  // Convert wavelength to RGB using CIE color matching functions
  static wavelengthToRGB(wavelength) {
    if (wavelength < WAVELENGTH_MIN || wavelength > WAVELENGTH_MAX) {
      return { r: 0, g: 0, b: 0 }
    }

    // Calculate index and offset for interpolation
    const index = Math.floor((wavelength - WAVELENGTH_MIN) / WAVELENGTH_STEP)
    const offset = wavelength - (WAVELENGTH_MIN + index * WAVELENGTH_STEP)
    
    // Interpolate XYZ values
    const x = this.interpolate(CIE_X, index, offset)
    const y = this.interpolate(CIE_Y, index, offset)
    const z = this.interpolate(CIE_Z, index, offset)
    
    // Convert XYZ to RGB using transformation matrix
    const r = MATRIX_SRGB_D65[0] * x + MATRIX_SRGB_D65[1] * y + MATRIX_SRGB_D65[2] * z
    const g = MATRIX_SRGB_D65[3] * x + MATRIX_SRGB_D65[4] * y + MATRIX_SRGB_D65[5] * z
    const b = MATRIX_SRGB_D65[6] * x + MATRIX_SRGB_D65[7] * y + MATRIX_SRGB_D65[8] * z
    
    // Apply gamma correction and clipping
    return {
      r: this.clip(this.gammaCorrect(r)),
      g: this.clip(this.gammaCorrect(g)),
      b: this.clip(this.gammaCorrect(b))
    }
  }

  // Linear interpolation helper
  static interpolate(values, index, offset) {
    if (offset === 0 || index >= values.length - 1) {
      return values[index] || 0
    }
    
    const y0 = values[index]
    const y1 = values[index + 1]
    return y0 + (offset / WAVELENGTH_STEP) * (y1 - y0)
  }

  // sRGB gamma correction
  static gammaCorrect(c) {
    if (c <= 0.0031308) {
      return 12.92 * c
    }
    const a = 0.055
    return (1 + a) * Math.pow(c, 1 / 2.4) - a
  }

  // Clip value to 0-1 range
  static clip(c) {
    return Math.max(0, Math.min(1, c))
  }

  // Convert HSL to RGB
  static hslToRgb(h, s, l) {
    h = h / 360
    s = s / 100
    l = l / 100
    
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }
    
    let r, g, b
    
    if (s === 0) {
      r = g = b = l // achromatic
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = hue2rgb(p, q, h + 1/3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1/3)
    }
    
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    }
  }

  // Convert RGB to hex string
  static rgbToHex(r, g, b) {
    const toHex = (c) => {
      const hex = Math.round(c * 255).toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }
    
    if (typeof r === 'object') {
      return `#${toHex(r.r)}${toHex(r.g)}${toHex(r.b)}`
    }
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
  }

  // Main conversion function: frequency to color
  static frequencyToColor(frequency, amplitude = 1.0, method = 'wavelength') {
    if (method === 'hsl') {
      const hsl = this.frequencyToHSL(frequency, amplitude)
      const rgb = this.hslToRgb(hsl.h, hsl.s, hsl.l)
      return this.rgbToHex(rgb.r / 255, rgb.g / 255, rgb.b / 255)
    } else {
      const wavelength = this.frequencyToWavelength(frequency)
      const rgb = this.wavelengthToRGB(wavelength)
      return this.rgbToHex(rgb)
    }
  }
}

// Color averaging utility
export class ColorAverager {
  constructor(windowSize = 30) {
    this.windowSize = windowSize
    this.colorHistory = []
  }

  addColor(hexColor) {
    // Convert hex to RGB
    const rgb = this.hexToRgb(hexColor)
    if (!rgb) return this.getAverage()
    
    this.colorHistory.push(rgb)
    
    // Keep only the last windowSize colors
    if (this.colorHistory.length > this.windowSize) {
      this.colorHistory.shift()
    }
    
    return this.getAverage()
  }

  getAverage() {
    if (this.colorHistory.length === 0) {
      return '#000000'
    }
    
    const sum = this.colorHistory.reduce(
      (acc, color) => ({
        r: acc.r + color.r,
        g: acc.g + color.g,
        b: acc.b + color.b
      }),
      { r: 0, g: 0, b: 0 }
    )
    
    const avg = {
      r: Math.round(sum.r / this.colorHistory.length),
      g: Math.round(sum.g / this.colorHistory.length),
      b: Math.round(sum.b / this.colorHistory.length)
    }
    
    return ColorConverter.rgbToHex(avg.r / 255, avg.g / 255, avg.b / 255)
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  reset() {
    this.colorHistory = []
  }
}

