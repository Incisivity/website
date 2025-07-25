// Audio analysis utilities for FFT processing and frequency analysis

export class AudioAnalyzer {
  constructor() {
    this.audioContext = null
    this.analyser = null
    this.microphone = null
    this.fftSize = 2048
    this.sampleRate = 44100
  }

  async initialize() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
      this.sampleRate = this.audioContext.sampleRate
      this.analyser = this.audioContext.createAnalyser()
      this.microphone = this.audioContext.createMediaStreamSource(stream)
      
      this.analyser.fftSize = this.fftSize
      this.analyser.smoothingTimeConstant = 0.3
      this.microphone.connect(this.analyser)
      
      return true
    } catch (error) {
      console.error('Failed to initialize audio analyzer:', error)
      throw error
    }
  }

  getFrequencyData() {
    if (!this.analyser) return null
    
    const bufferLength = this.analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    this.analyser.getByteFrequencyData(dataArray)
    
    return {
      data: dataArray,
      bufferLength,
      sampleRate: this.sampleRate,
      fftSize: this.fftSize
    }
  }

  getTimeData() {
    if (!this.analyser) return null
    
    const bufferLength = this.analyser.fftSize
    const dataArray = new Uint8Array(bufferLength)
    this.analyser.getByteTimeDomainData(dataArray)
    
    return dataArray
  }

  // Calculate the dominant frequency using FFT data
  getDominantFrequency() {
    const frequencyData = this.getFrequencyData()
    if (!frequencyData) return 0
    
    const { data, bufferLength, sampleRate } = frequencyData
    
    let maxIndex = 0
    let maxValue = 0
    
    // Focus on human voice frequency range (80Hz - 1000Hz)
    const minFreqIndex = Math.floor((80 * bufferLength * 2) / sampleRate)
    const maxFreqIndex = Math.floor((1000 * bufferLength * 2) / sampleRate)
    
    for (let i = minFreqIndex; i < Math.min(maxFreqIndex, bufferLength); i++) {
      if (data[i] > maxValue) {
        maxValue = data[i]
        maxIndex = i
      }
    }
    
    // Convert bin index to frequency
    const frequency = (maxIndex * sampleRate) / (2 * bufferLength)
    return { frequency, amplitude: maxValue }
  }

  // Calculate weighted average frequency based on amplitude
  getWeightedAverageFrequency() {
    const frequencyData = this.getFrequencyData()
    if (!frequencyData) return 0
    
    const { data, bufferLength, sampleRate } = frequencyData
    
    let weightedSum = 0
    let totalWeight = 0
    
    // Focus on human voice frequency range (80Hz - 1000Hz)
    const minFreqIndex = Math.floor((80 * bufferLength * 2) / sampleRate)
    const maxFreqIndex = Math.floor((1000 * bufferLength * 2) / sampleRate)
    
    for (let i = minFreqIndex; i < Math.min(maxFreqIndex, bufferLength); i++) {
      const frequency = (i * sampleRate) / (2 * bufferLength)
      const amplitude = data[i]
      
      if (amplitude > 10) { // Filter out noise
        weightedSum += frequency * amplitude
        totalWeight += amplitude
      }
    }
    
    return totalWeight > 0 ? weightedSum / totalWeight : 0
  }

  // Get audio level for visualization
  getAudioLevel() {
    const frequencyData = this.getFrequencyData()
    if (!frequencyData) return 0
    
    const { data, bufferLength } = frequencyData
    const sum = data.reduce((a, b) => a + b, 0)
    return (sum / bufferLength) / 255
  }

  // Get spectral centroid (brightness measure)
  getSpectralCentroid() {
    const frequencyData = this.getFrequencyData()
    if (!frequencyData) return 0
    
    const { data, bufferLength, sampleRate } = frequencyData
    
    let weightedSum = 0
    let magnitudeSum = 0
    
    for (let i = 0; i < bufferLength; i++) {
      const frequency = (i * sampleRate) / (2 * bufferLength)
      const magnitude = data[i]
      
      weightedSum += frequency * magnitude
      magnitudeSum += magnitude
    }
    
    return magnitudeSum > 0 ? weightedSum / magnitudeSum : 0
  }

  disconnect() {
    if (this.microphone) {
      this.microphone.disconnect()
    }
    if (this.audioContext) {
      this.audioContext.close()
    }
  }
}

