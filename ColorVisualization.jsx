import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Slider } from '@/components/ui/slider.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { TrendingUp, TrendingDown, Minus, Palette, Settings2 } from 'lucide-react'

export function ColorVisualization({ 
  currentColor, 
  averageColor, 
  recentColors = [], 
  frequencyTrend = 'stable',
  frequencyStability = 1,
  colorVariance = 0,
  onAveragingMethodChange,
  onWindowSizeChange,
  averagingMethod = 'sliding',
  windowSize = 30
}) {
  const [showSettings, setShowSettings] = useState(false)

  const getTrendIcon = () => {
    switch (frequencyTrend) {
      case 'rising': return <TrendingUp className="w-4 h-4 text-green-400" />
      case 'falling': return <TrendingDown className="w-4 h-4 text-red-400" />
      default: return <Minus className="w-4 h-4 text-blue-400" />
    }
  }

  const getStabilityColor = () => {
    if (frequencyStability > 0.8) return 'bg-green-500'
    if (frequencyStability > 0.5) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Voice Color Analysis
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="text-white hover:bg-white/10"
          >
            <Settings2 className="w-4 h-4" />
          </Button>
        </CardTitle>
        <CardDescription className="text-blue-200">
          Advanced color representation with trend analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Settings Panel */}
        {showSettings && (
          <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="space-y-2">
              <label className="text-white text-sm">Averaging Method</label>
              <div className="flex gap-2">
                <Button
                  variant={averagingMethod === 'sliding' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onAveragingMethodChange('sliding')}
                  className="text-xs"
                >
                  Sliding Window
                </Button>
                <Button
                  variant={averagingMethod === 'exponential' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onAveragingMethodChange('exponential')}
                  className="text-xs"
                >
                  Exponential
                </Button>
                <Button
                  variant={averagingMethod === 'weighted' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onAveragingMethodChange('weighted')}
                  className="text-xs"
                >
                  Weighted
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-white text-sm">Window Size: {windowSize}</label>
              <Slider
                value={[windowSize]}
                onValueChange={(value) => onWindowSizeChange(value[0])}
                max={100}
                min={5}
                step={5}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Main Color Display */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-white text-sm mb-2 flex items-center gap-2">
              Current Color
              {getTrendIcon()}
            </div>
            <div 
              className="w-full h-20 rounded-lg border-2 border-white/30 transition-colors duration-200 shadow-lg"
              style={{ 
                backgroundColor: currentColor,
                boxShadow: `0 0 20px ${currentColor}40`
              }}
            />
            <div className="text-center text-white/80 text-xs mt-1 font-mono">
              {currentColor}
            </div>
          </div>
          
          <div>
            <div className="text-white text-sm mb-2">Average Color</div>
            <div 
              className="w-full h-20 rounded-lg border-2 border-white/30 shadow-lg"
              style={{ 
                backgroundColor: averageColor,
                boxShadow: `0 0 20px ${averageColor}40`
              }}
            />
            <div className="text-center text-white/80 text-xs mt-1 font-mono">
              {averageColor}
            </div>
          </div>
        </div>

        {/* Recent Colors Timeline */}
        {recentColors.length > 0 && (
          <div className="space-y-2">
            <div className="text-white text-sm">Recent Color History</div>
            <div className="flex gap-1 overflow-hidden">
              {recentColors.map((color, index) => (
                <div
                  key={index}
                  className="flex-1 h-4 rounded transition-all duration-300"
                  style={{ 
                    backgroundColor: color,
                    opacity: 0.3 + (index / recentColors.length) * 0.7
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Analysis Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-white text-sm">Voice Stability</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getStabilityColor()}`}
                  style={{ width: `${frequencyStability * 100}%` }}
                />
              </div>
              <Badge variant="secondary" className="text-xs">
                {Math.round(frequencyStability * 100)}%
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-white text-sm">Color Variance</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (colorVariance / 50) * 100)}%` }}
                />
              </div>
              <Badge variant="secondary" className="text-xs">
                {Math.round(colorVariance)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Frequency Trend Indicator */}
        <div className="flex items-center justify-center gap-2 p-2 bg-white/5 rounded-lg">
          {getTrendIcon()}
          <span className="text-white text-sm">
            Voice frequency is {frequencyTrend}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

