import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Mic, MicOff, Volume2, Settings } from 'lucide-react'
import { AudioAnalyzer } from './lib/audioAnalyzer.js'
import { ColorConverter } from './lib/colorConverter.js'
import { AdvancedColorAverager, FrequencyAnalyzer } from './lib/advancedAnalysis.js'
import { ColorVisualization } from './components/ColorVisualization.jsx'
import './App.css'

function App() {
  const [isRecording, setIsRecording] = useState(false)
  const [currentColor, setCurrentColor] = useState('#000000')
  const [averageColor, setAverageColor] = useState('#000000')
  const [audioLevel, setAudioLevel] = useState(0)
  const [frequency, setFrequency] = useState(0)
  const [error, setError] = useState('')
  const [colorMethod, setColorMethod] = useState('wavelength')
  const [averagingMethod, setAveragingMethod] = useState('sliding')
  const [windowSize, setWindowSize] = useState(30)
  const [recentColors, setRecentColors] = useState([])
  const [frequencyTrend, setFrequencyTrend] = useState('stable')
  const [frequencyStability, setFrequencyStability] = useState(1)
  const [colorVariance, setColorVariance] = useState(0)

  const audioAnalyzerRef = useRef(null)
  const colorAveragerRef = useRef(new AdvancedColorAverager({ windowSize: 30 }))
  const frequencyAnalyzerRef = useRef(new FrequencyAnalyzer())
  const animationFrameRef = useRef(null)

  const startRecording = async () => {
    try {
      setError('')
      audioAnalyzerRef.current = new AudioAnalyzer()
      await audioAnalyzerRef.current.initialize()
      
      setIsRecording(true)
      processAudio()
    } catch (err) {
      setError('Failed to access microphone. Please allow microphone access.')
      console.error('Error accessing microphone:', err)
    }
  }

  const stopRecording = () => {
    if (audioAnalyzerRef.current) {
      audioAnalyzerRef.current.disconnect()
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    setIsRecording(false)
    setAudioLevel(0)
    setFrequency(0)
    colorAveragerRef.current.reset()
    frequencyAnalyzerRef.current.reset()
    setRecentColors([])
  }

  const processAudio = () => {
    if (!audioAnalyzerRef.current) return
    
    const analyze = () => {
      // Get audio level for visualization
      const level = audioAnalyzerRef.current.getAudioLevel()
      setAudioLevel(level)
      
      // Get dominant frequency using advanced analysis
      const dominantFreq = audioAnalyzerRef.current.getWeightedAverageFrequency()
      setFrequency(Math.round(dominantFreq))
      
      // Add frequency to analyzer for trend analysis
      if (dominantFreq > 0 && level > 0.01) {
        frequencyAnalyzerRef.current.addFrequency(dominantFreq, level)
        
        // Update frequency trend and stability
        setFrequencyTrend(frequencyAnalyzerRef.current.getFrequencyTrend())
        setFrequencyStability(frequencyAnalyzerRef.current.getFrequencyStability())
        
        // Convert frequency to color using sophisticated algorithm
        const amplitude = Math.min(1.0, level * 5)
        const color = ColorConverter.frequencyToColor(dominantFreq, amplitude, colorMethod)
        setCurrentColor(color)
        
        // Update average color based on selected method
        const avgColor = colorAveragerRef.current.addColor(color)
        setAverageColor(colorAveragerRef.current.getAverage(averagingMethod))
        
        // Update recent colors and variance
        setRecentColors(colorAveragerRef.current.getRecentColors(10))
        setColorVariance(colorAveragerRef.current.getColorVariance())
      }
      
      animationFrameRef.current = requestAnimationFrame(analyze)
    }
    
    analyze()
  }

  const handleAveragingMethodChange = (method) => {
    setAveragingMethod(method)
  }

  const handleWindowSizeChange = (size) => {
    setWindowSize(size)
    colorAveragerRef.current.setParameters({ windowSize: size })
  }

  useEffect(() => {
    return () => {
      if (isRecording) {
        stopRecording()
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Voice Color Analyzer</h1>
          <p className="text-blue-200 text-lg">Transform your voice into beautiful colors using FFT analysis</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Control Panel */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Mic className="w-5 h-5" />
                Audio Control
              </CardTitle>
              <CardDescription className="text-blue-200">
                Start recording to analyze your voice
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-full ${isRecording 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-green-600 hover:bg-green-700'
                } text-white`}
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-4 h-4 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    Start Recording
                  </>
                )}
              </Button>
              
              {error && (
                <div className="text-red-300 text-sm bg-red-900/30 p-3 rounded">
                  {error}
                </div>
              )}
              
              {/* Audio Level Indicator */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white text-sm">
                  <Volume2 className="w-4 h-4" />
                  Audio Level
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-100"
                    style={{ width: `${audioLevel * 100}%` }}
                  />
                </div>
              </div>

              {/* Frequency Display */}
              {isRecording && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white text-sm">
                    <Settings className="w-4 h-4" />
                    Frequency: {frequency} Hz
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={colorMethod === 'wavelength' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setColorMethod('wavelength')}
                      className="text-xs"
                    >
                      Wavelength
                    </Button>
                    <Button
                      variant={colorMethod === 'hsl' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setColorMethod('hsl')}
                      className="text-xs"
                    >
                      HSL
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Advanced Color Visualization */}
          <div className="lg:col-span-2">
            <ColorVisualization
              currentColor={currentColor}
              averageColor={averageColor}
              recentColors={recentColors}
              frequencyTrend={frequencyTrend}
              frequencyStability={frequencyStability}
              colorVariance={colorVariance}
              onAveragingMethodChange={handleAveragingMethodChange}
              onWindowSizeChange={handleWindowSizeChange}
              averagingMethod={averagingMethod}
              windowSize={windowSize}
            />
          </div>
        </div>

        {/* Information Section */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white">How It Works</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-200 space-y-3">
            <p>
              This application uses Fast Fourier Transform (FFT) to analyze the frequency content of your voice in real-time.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-white mb-2">Color Mapping Methods:</p>
                <p className="text-sm">
                  <strong>Wavelength:</strong> Maps audio frequencies to light wavelengths using electromagnetic wave relationships and CIE color matching functions.
                </p>
                <p className="text-sm mt-2">
                  <strong>HSL:</strong> Uses perceptual color mapping where low frequencies become warm colors and high frequencies become cool colors.
                </p>
              </div>
              <div>
                <p className="font-semibold text-white mb-2">Averaging Methods:</p>
                <p className="text-sm">
                  <strong>Sliding Window:</strong> Simple average of recent colors.
                </p>
                <p className="text-sm mt-1">
                  <strong>Exponential:</strong> Weighted average favoring recent colors.
                </p>
                <p className="text-sm mt-1">
                  <strong>Weighted:</strong> Recent colors have progressively higher influence.
                </p>
              </div>
            </div>
            <p>
              The analysis includes voice stability tracking, frequency trend detection, and color variance measurement 
              to provide comprehensive insights into your vocal characteristics.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default App

