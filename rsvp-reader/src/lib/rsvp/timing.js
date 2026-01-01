/**
 * Calculate display duration for a word based on:
 * - Base WPM setting
 * - Word length (longer words need more time)
 * - Punctuation (pauses at sentence boundaries)
 * - Paragraph breaks
 */
export function calculateWordDuration(word, baseWPM, nextWord = '') {
  // Base duration in milliseconds
  const baseMs = 60000 / baseWPM;
  
  // Start with base multiplier
  let multiplier = 1.0;
  
  // Longer words take more time to process
  if (word.length > 9) {
    multiplier = 1.5;
  } else if (word.length > 13) {
    multiplier = 2.0;
  }
  
  // Check for punctuation at end of word
  const lastChar = word[word.length - 1];
  
  // Comma pause (clause boundary)
  if (lastChar === ',' || lastChar === ';' || lastChar === ':') {
    multiplier = Math.max(multiplier, 1.5);
  }
  
  // Sentence end pause (longer - allows comprehension integration)
  if (lastChar === '.' || lastChar === '!' || lastChar === '?') {
    multiplier = Math.max(multiplier, 2.5);
  }
  
  // Paragraph break detection (extra long pause)
  // If next word starts with newline or is empty, it's likely a paragraph break
  if (/[.!?]$/.test(word) && (!nextWord || nextWord === '\n')) {
    multiplier = 3.5;
  }
  
  return Math.round(baseMs * multiplier);
}

/**
 * Calculate total reading time for a set of tokens
 */
export function estimateTotalTime(tokens, wpm) {
  let totalMs = 0;
  
  tokens.forEach((token, idx) => {
    const nextToken = tokens[idx + 1];
    totalMs += calculateWordDuration(token.word, wpm, nextToken?.word);
  });
  
  return totalMs;
}

/**
 * Format milliseconds into human-readable time
 */
export function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Calculate remaining reading time from current position
 */
export function calculateRemainingTime(tokens, currentIdx, wpm) {
  const remainingTokens = tokens.slice(currentIdx);
  return estimateTotalTime(remainingTokens, wpm);
}

/**
 * Detect chapter boundaries in tokens
 * Looks for common chapter patterns like "Chapter 1", "CHAPTER ONE", etc.
 */
export function detectChapters(tokens) {
  const chapters = [];
  const chapterRegex = /^(chapter|ch\.|section|part)\s*[\d\w]+/i;
  
  tokens.forEach((token, idx) => {
    // Check current and next few tokens for chapter markers
    const context = tokens.slice(idx, idx + 5).map(t => t.word).join(' ');
    
    if (chapterRegex.test(context)) {
      chapters.push({
        startIdx: idx,
        title: context.slice(0, 50), // First 50 chars as title
        page: token.page,
      });
    }
  });
  
  // Add word counts to each chapter
  chapters.forEach((chapter, idx) => {
    const nextChapter = chapters[idx + 1];
    chapter.endIdx = nextChapter ? nextChapter.startIdx : tokens.length;
    chapter.wordCount = chapter.endIdx - chapter.startIdx;
  });
  
  return chapters;
}

/**
 * Find which chapter a token index belongs to
 */
export function getCurrentChapter(tokens, currentIdx) {
  const chapters = detectChapters(tokens);
  
  for (let i = chapters.length - 1; i >= 0; i--) {
    if (currentIdx >= chapters[i].startIdx) {
      return {
        ...chapters[i],
        number: i + 1,
        total: chapters.length,
      };
    }
  }
  
  return null;
}
