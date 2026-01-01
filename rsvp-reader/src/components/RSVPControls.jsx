import { Play, Pause, SkipBack, SkipForward, Rewind, FastForward } from 'lucide-react';

export default function RSVPControls({
  isPlaying,
  onPlayPause,
  wpm,
  onWpmChange,
  onJumpBack,
  onJumpForward,
  onPreviousSentence,
  onNextSentence,
}) {
  // WPM presets with labels
  const presets = [
    { wpm: 150, label: 'Study' },
    { wpm: 250, label: 'Comfortable' },
    { wpm: 300, label: 'Default' },
    { wpm: 350, label: 'Fast' },
    { wpm: 450, label: 'Skim' },
  ];
  
  return (
    <div className="border-t border-gray-200 bg-white p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={onPreviousSentence}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Previous sentence"
          >
            <SkipBack className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => onJumpBack(5000)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Back 5 seconds"
          >
            <Rewind className="w-5 h-5" />
          </button>
          
          <button
            onClick={onPlayPause}
            className="p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-0.5" />
            )}
          </button>
          
          <button
            onClick={() => onJumpForward(5000)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Forward 5 seconds"
          >
            <FastForward className="w-5 h-5" />
          </button>
          
          <button
            onClick={onNextSentence}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Next sentence"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>
        
        {/* Speed Control */}
        <div className="space-y-4">
          {/* Speed Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Speed: {wpm} WPM
              </label>
              <span className="text-xs text-gray-500">
                {wpm <= 200 && 'Study mode'}
                {wpm > 200 && wpm <= 300 && 'Comfortable'}
                {wpm > 300 && wpm <= 400 && 'Fast'}
                {wpm > 400 && 'Skimming'}
              </span>
            </div>
            
            <input
              type="range"
              min="100"
              max="600"
              step="10"
              value={wpm}
              onChange={(e) => onWpmChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
          
          {/* Speed Presets */}
          <div className="flex gap-2 justify-center">
            {presets.map((preset) => (
              <button
                key={preset.wpm}
                onClick={() => onWpmChange(preset.wpm)}
                className={`
                  px-3 py-1 rounded text-sm font-medium transition-colors
                  ${wpm === preset.wpm 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
}
