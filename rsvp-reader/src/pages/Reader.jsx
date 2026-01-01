import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowLeft, Bookmark, Settings } from 'lucide-react';
import { getBook, getTokens, saveProgress, getProgress } from '../lib/db';
import RSVPStage from '../components/RSVPStage';
import RSVPControls from '../components/RSVPControls';
import { calculateWordDuration } from '../lib/rsvp/timing';

export default function Reader() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  
  // State
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wpm, setWpm] = useState(300); // Default 300 WPM
  const [fontSize, setFontSize] = useState(48);
  const [showSettings, setShowSettings] = useState(false);
  
  // Load book and tokens from IndexedDB
  const book = useLiveQuery(
    () => getBook(Number(bookId)),
    [bookId]
  );
  
  const tokens = useLiveQuery(
    () => getTokens(Number(bookId)),
    [bookId]
  );
  
  // Load saved progress on mount
  useEffect(() => {
    const loadProgress = async () => {
      const progress = await getProgress(Number(bookId));
      if (progress && progress.tokenIdx) {
        setCurrentIdx(progress.tokenIdx);
      }
    };
    loadProgress();
  }, [bookId]);
  
  // Auto-save progress every 5 seconds while reading
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      saveProgress(Number(bookId), currentIdx);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [bookId, currentIdx, isPlaying]);
  
  // Save progress when pausing or unmounting
  useEffect(() => {
    return () => {
      saveProgress(Number(bookId), currentIdx);
    };
  }, [bookId, currentIdx]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Space: Play/Pause
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      }
      // Arrow Left: Back 10 words
      else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleJumpBack(3000); // ~10 words at 200 WPM
      }
      // Arrow Right: Forward 10 words
      else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleJumpForward(3000);
      }
      // Arrow Up: Increase speed
      else if (e.code === 'ArrowUp') {
        e.preventDefault();
        setWpm(prev => Math.min(600, prev + 50));
      }
      // Arrow Down: Decrease speed
      else if (e.code === 'ArrowDown') {
        e.preventDefault();
        setWpm(prev => Math.max(100, prev - 50));
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);
  
  // Navigation functions
  const handleJumpBack = useCallback((milliseconds) => {
    if (!tokens) return;
    
    let totalTime = 0;
    let targetIdx = currentIdx;
    
    // Walk backwards until we've covered the time
    for (let i = currentIdx - 1; i >= 0; i--) {
      const duration = calculateWordDuration(
        tokens[i].word,
        wpm,
        tokens[i + 1]?.word
      );
      totalTime += duration;
      targetIdx = i;
      
      if (totalTime >= milliseconds) break;
    }
    
    setCurrentIdx(Math.max(0, targetIdx));
  }, [currentIdx, tokens, wpm]);
  
  const handleJumpForward = useCallback((milliseconds) => {
    if (!tokens) return;
    
    let totalTime = 0;
    let targetIdx = currentIdx;
    
    // Walk forwards until we've covered the time
    for (let i = currentIdx; i < tokens.length - 1; i++) {
      const duration = calculateWordDuration(
        tokens[i].word,
        wpm,
        tokens[i + 1]?.word
      );
      totalTime += duration;
      targetIdx = i + 1;
      
      if (totalTime >= milliseconds) break;
    }
    
    setCurrentIdx(Math.min(tokens.length - 1, targetIdx));
  }, [currentIdx, tokens, wpm]);
  
  const handlePreviousSentence = useCallback(() => {
    if (!tokens) return;
    
    // Find previous sentence-ending punctuation
    for (let i = currentIdx - 1; i >= 0; i--) {
      const word = tokens[i].word;
      if (/[.!?]$/.test(word)) {
        setCurrentIdx(i + 1); // Start of next sentence
        return;
      }
    }
    
    // If no sentence found, go to beginning
    setCurrentIdx(0);
  }, [currentIdx, tokens]);
  
  const handleNextSentence = useCallback(() => {
    if (!tokens) return;
    
    // Find next sentence-ending punctuation
    for (let i = currentIdx; i < tokens.length; i++) {
      const word = tokens[i].word;
      if (/[.!?]$/.test(word)) {
        setCurrentIdx(Math.min(tokens.length - 1, i + 1));
        return;
      }
    }
    
    // If no sentence found, stay at end
    setCurrentIdx(tokens.length - 1);
  }, [currentIdx, tokens]);
  
  // Get context text (3 sentences before and after current position)
  const getContextText = useCallback(() => {
    if (!tokens) return '';
    
    const contextRange = 50; // ~50 words of context
    const startIdx = Math.max(0, currentIdx - contextRange);
    const endIdx = Math.min(tokens.length, currentIdx + contextRange);
    
    return tokens
      .slice(startIdx, endIdx)
      .map(t => t.word)
      .join(' ');
  }, [tokens, currentIdx]);
  
  // Calculate progress percentage
  const progressPercent = tokens 
    ? Math.round((currentIdx / tokens.length) * 100)
    : 0;
  
  // Calculate current page (for PDFs)
  const currentPage = tokens && currentIdx < tokens.length
    ? tokens[currentIdx].page
    : 1;
  
  // Loading state
  if (!book || !tokens) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading book...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/library')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Back to library"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {book.title}
              </h1>
              <p className="text-sm text-gray-500">
                {book.fileType.toUpperCase()} · Page {currentPage} · {progressPercent}% complete
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => {
                // TODO: Implement bookmark functionality
                alert('Bookmark saved!');
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Add bookmark"
            >
              <Bookmark className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </header>
      
      {/* Settings Panel (collapsible) */}
      {showSettings && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-4">
          <div className="max-w-2xl mx-auto">
            <h3 className="font-medium text-gray-900 mb-3">Display Settings</h3>
            
            <div className="space-y-3">
              {/* Font Size */}
              <div>
                <label className="text-sm text-gray-700 block mb-1">
                  Font Size: {fontSize}px
                </label>
                <input
                  type="range"
                  min="24"
                  max="72"
                  step="4"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Main RSVP Stage */}
      <main className="flex-1 flex items-center justify-center relative">
        <RSVPStage
          tokens={tokens}
          currentIdx={currentIdx}
          wpm={wpm}
          isPlaying={isPlaying}
          onIdxChange={setCurrentIdx}
          fontSize={fontSize}
        />
        
        {/* Context Panel (shown when paused) */}
        {!isPlaying && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 max-w-2xl w-full px-4">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600 leading-relaxed">
                {getContextText()}
              </p>
            </div>
          </div>
        )}
      </main>
      
      {/* Controls */}
      <RSVPControls
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        wpm={wpm}
        onWpmChange={setWpm}
        onJumpBack={handleJumpBack}
        onJumpForward={handleJumpForward}
        onPreviousSentence={handlePreviousSentence}
        onNextSentence={handleNextSentence}
      />
      
    </div>
  );
}
