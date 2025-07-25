import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Waveform, Activity, Zap } from 'lucide-react'

export function FrequencySpectrum({ 
  frequencyData = null, 
  isRecording = false,
  dominantFrequency = 0,
  spectralCentroid = 0
}) {
  const [animatedBars, setAnimatedBars] = useState([])

  useEffect(() => {
    if (frequencyData && isRecording) {
      // Create animated frequency bars
      const bars = []
      const step = Math.floor(frequencyData.bufferLength / 32) // Show 32 bars
      
      for (let i = 0; i < 32; i++) {
        const index = i * step
        const value = frequencyData.data[index] || 0
        const frequency = (index * frequencyData.sampleRate) / (2 * frequencyData.bufferLength)
        
        bars.push({
          id: i,
          value: value / 255, // Normalize to 0-1
          frequency: Math.round(frequency),
          isDominant: Math.abs(frequency - dominantFrequency) < 50
        })
      }
      
      setAnimatedBars(bars)
    } else {
      setAnimatedBars([])
    }
  }, [frequencyData, isRecording, dominantFrequency])

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Waveform className="w-5 h-5" />
          Frequency Spectrum
        </CardTitle>
        <CardDescription className="text-blue-200">
          Real-time frequency analysis visualization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Frequency Bars */}
        <div className="h-32 flex items-end justify-center gap-1 bg-black/20 rounded-lg p-4">
          {animatedBars.length > 0 ? (
            animatedBars.map((bar) => (
              <div
                key={bar.id}
                className={`flex-1 rounded-t transition-all duration-150 ${
                  bar.isDominant 
                    ? 'bg-gradient-to-t from-yellow-500 to-orange-400 shadow-lg shadow-yellow-500/50' 
                    : 'bg-gradient-to-t from-blue-500 to-purple-400'
                }`}
                style={{
                  height: `${Math.max(2, bar.value * 100)}%`,
                  maxWidth: '8px'
                }}
                title={`${bar.frequency} Hz`}
              />
            ))
          ) : (
            <div className="flex items-center justify-center h-full text-white/50 text-sm">
              {isRecording ? 'Analyzing audio...' : 'Start recording to see frequency spectrum'}
            </div>
          )}
        </div>

        {/* Frequency Info */}
        {isRecording && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white text-sm">
                <Activity className="w-4 h-4" />
                Dominant Frequency
              </div>
              <Badge variant="secondary" className="w-full justify-center">
                {dominantFrequency} Hz
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white text-sm">
                <Zap className="w-4 h-4" />
                Spectral Centroid
              </div>
              <Badge variant="secondary" className="w-full justify-center">
                {Math.round(spectralCentroid)} Hz
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

