// Enhanced color averaging and smoothing algorithms

export class AdvancedColorAverager {
  constructor(options = {}) {
    this.windowSize = options.windowSize || 30
    this.smoothingFactor = options.smoothingFactor || 0.1
    this.colorHistory = []
    this.exponentialAverage = { r: 0, g: 0, b: 0 }
    this.initialized = false
  }

  addColor(hexColor) {
    const rgb = this.hexToRgb(hexColor)
    if (!rgb) return this.getAverage()
    
    // Add to history for sliding window average
    this.colorHistory.push(rgb)
    if (this.colorHistory.length > this.windowSize) {
      this.colorHistory.shift()
    }
    
    // Update exponential moving average
    if (!this.initialized) {
      this.exponentialAverage = { ...rgb }
      this.initialized = true
    } else {
      this.exponentialAverage.r = this.exponentialAverage.r * (1 - this.smoothingFactor) + rgb.r * this.smoothingFactor
      this.exponentialAverage.g = this.exponentialAverage.g * (1 - this.smoothingFactor) + rgb.g * this.smoothingFactor
      this.exponentialAverage.b = this.exponentialAverage.b * (1 - this.smoothingFactor) + rgb.b * this.smoothingFactor
    }
    
    return this.getAverage()
  }

  getAverage(method = 'sliding') {
    if (method === 'exponential') {
      return this.rgbToHex(
        Math.round(this.exponentialAverage.r),
        Math.round(this.exponentialAverage.g),
        Math.round(this.exponentialAverage.b)
      )
    }
    
    // Sliding window average (default)
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
    
    return this.rgbToHex(avg.r, avg.g, avg.b)
  }

  // Get weighted average based on recency
  getWeightedAverage() {
    if (this.colorHistory.length === 0) {
      return '#000000'
    }
    
    let weightedSum = { r: 0, g: 0, b: 0 }
    let totalWeight = 0
    
    this.colorHistory.forEach((color, index) => {
      // More recent colors get higher weight
      const weight = (index + 1) / this.colorHistory.length
      weightedSum.r += color.r * weight
      weightedSum.g += color.g * weight
      weightedSum.b += color.b * weight
      totalWeight += weight
    })
    
    const avg = {
      r: Math.round(weightedSum.r / totalWeight),
      g: Math.round(weightedSum.g / totalWeight),
      b: Math.round(weightedSum.b / totalWeight)
    }
    
    return this.rgbToHex(avg.r, avg.g, avg.b)
  }

  // Get color variance (how much the colors are changing)
  getColorVariance() {
    if (this.colorHistory.length < 2) return 0
    
    const avg = this.getAverageRgb()
    const variance = this.colorHistory.reduce((sum, color) => {
      const dr = color.r - avg.r
      const dg = color.g - avg.g
      const db = color.b - avg.b
      return sum + (dr * dr + dg * dg + db * db)
    }, 0) / this.colorHistory.length
    
    return Math.sqrt(variance)
  }

  getAverageRgb() {
    if (this.colorHistory.length === 0) {
      return { r: 0, g: 0, b: 0 }
    }
    
    const sum = this.colorHistory.reduce(
      (acc, color) => ({
        r: acc.r + color.r,
        g: acc.g + color.g,
        b: acc.b + color.b
      }),
      { r: 0, g: 0, b: 0 }
    )
    
    return {
      r: sum.r / this.colorHistory.length,
      g: sum.g / this.colorHistory.length,
      b: sum.b / this.colorHistory.length
    }
  }

  // Get the most recent N colors for visualization
  getRecentColors(count = 10) {
    const recent = this.colorHistory.slice(-count)
    return recent.map(rgb => this.rgbToHex(rgb.r, rgb.g, rgb.b))
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  rgbToHex(r, g, b) {
    const toHex = (c) => {
      const hex = Math.round(c).toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
  }

  reset() {
    this.colorHistory = []
    this.exponentialAverage = { r: 0, g: 0, b: 0 }
    this.initialized = false
  }

  // Set new parameters
  setParameters(options) {
    if (options.windowSize !== undefined) {
      this.windowSize = options.windowSize
      // Trim history if new window size is smaller
      if (this.colorHistory.length > this.windowSize) {
        this.colorHistory = this.colorHistory.slice(-this.windowSize)
      }
    }
    if (options.smoothingFactor !== undefined) {
      this.smoothingFactor = options.smoothingFactor
    }
  }
}

// Enhanced frequency analysis for better color mapping
export class FrequencyAnalyzer {
  constructor() {
    this.frequencyHistory = []
    this.windowSize = 20
  }

  addFrequency(frequency, amplitude) {
    this.frequencyHistory.push({ frequency, amplitude, timestamp: Date.now() })
    
    if (this.frequencyHistory.length > this.windowSize) {
      this.frequencyHistory.shift()
    }
  }

  // Get the most stable frequency (appears most consistently)
  getStableFrequency() {
    if (this.frequencyHistory.length === 0) return 0
    
    // Group frequencies into bins
    const bins = new Map()
    const binSize = 10 // Hz
    
    this.frequencyHistory.forEach(({ frequency, amplitude }) => {
      const bin = Math.floor(frequency / binSize) * binSize
      if (!bins.has(bin)) {
        bins.set(bin, { count: 0, totalAmplitude: 0, frequencies: [] })
      }
      const binData = bins.get(bin)
      binData.count++
      binData.totalAmplitude += amplitude
      binData.frequencies.push(frequency)
    })
    
    // Find the bin with highest weighted score (count * average amplitude)
    let bestBin = null
    let bestScore = 0
    
    bins.forEach((data, bin) => {
      const avgAmplitude = data.totalAmplitude / data.count
      const score = data.count * avgAmplitude
      if (score > bestScore) {
        bestScore = score
        bestBin = bin
      }
    })
    
    if (!bestBin) return 0
    
    // Return average frequency in the best bin
    const binData = bins.get(bestBin)
    return binData.frequencies.reduce((sum, f) => sum + f, 0) / binData.frequencies.length
  }

  // Get frequency trend (rising, falling, stable)
  getFrequencyTrend() {
    if (this.frequencyHistory.length < 3) return 'stable'
    
    const recent = this.frequencyHistory.slice(-5)
    const first = recent[0].frequency
    const last = recent[recent.length - 1].frequency
    
    const change = last - first
    const threshold = 20 // Hz
    
    if (change > threshold) return 'rising'
    if (change < -threshold) return 'falling'
    return 'stable'
  }

  // Get frequency stability (how much it varies)
  getFrequencyStability() {
    if (this.frequencyHistory.length < 2) return 1
    
    const frequencies = this.frequencyHistory.map(f => f.frequency)
    const avg = frequencies.reduce((sum, f) => sum + f, 0) / frequencies.length
    const variance = frequencies.reduce((sum, f) => sum + Math.pow(f - avg, 2), 0) / frequencies.length
    const stdDev = Math.sqrt(variance)
    
    // Return stability as a value between 0 and 1 (1 = very stable)
    return Math.max(0, 1 - stdDev / 100)
  }

  reset() {
    this.frequencyHistory = []
  }
}

