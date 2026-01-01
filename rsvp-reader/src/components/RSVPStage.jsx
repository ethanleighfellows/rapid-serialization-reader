import { useState, useEffect, useRef } from 'react';
import { splitWordAtORP } from '../lib/rsvp/orp';
import { calculateWordDuration } from '../lib/rsvp/timing';

export default function RSVPStage({ 
  tokens, 
  currentIdx, 
  wpm, 
  isPlaying, 
  onIdxChange,
  fontSize = 48
}) {
  const timerRef = useRef(null);
  
  const currentToken = tokens[currentIdx] || { word: '' };
  const { before, pivot, after } = splitWordAtORP(currentToken.word);
  
  // Auto-advance to next word when playing
  useEffect(() => {
    if (!isPlaying || currentIdx >= tokens.length - 1) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      return;
    }
    
    const nextToken = tokens[currentIdx + 1];
    const duration = calculateWordDuration(
      currentToken.word, 
      wpm, 
      nextToken?.word
    );
    
    timerRef.current = setTimeout(() => {
      onIdxChange(currentIdx + 1);
    }, duration);
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentIdx, isPlaying, wpm, tokens, onIdxChange, currentToken.word]);
  
  return (
    <div className="flex flex-col items-center justify-center h-full">
      {/* RSVP Display Area */}
      <div 
        className="relative flex items-center justify-center min-h-[120px] min-w-[400px]"
        style={{ fontSize: `${fontSize}px` }}
      >
        {/* Optional: Alignment guides (vertical lines) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-px h-full bg-gray-300 opacity-30" />
        </div>
        
        {/* Word Display with ORP alignment */}
        <div className="relative font-mono flex items-center">
          <span className="text-gray-900">{before}</span>
          <span className="text-red-500 font-bold">{pivot}</span>
          <span className="text-gray-900">{after}</span>
        </div>
      </div>
      
      {/* Progress indicator */}
      <div className="mt-8 text-sm text-gray-500">
        Word {currentIdx + 1} of {tokens.length}
      </div>
    </div>
  );
}
