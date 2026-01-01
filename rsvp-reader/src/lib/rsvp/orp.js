/**
 * Calculate the Optimal Recognition Point (ORP) for a word
 * Based on research: ORP is slightly left of center for English words
 * 
 * Word length → ORP index (0-based)
 * 1 char → index 0
 * 2-5 chars → index 1
 * 6-9 chars → index 2
 * 10-13 chars → index 3
 * 14+ chars → index 4
 */
export function calculateORP(word) {
  const len = word.length;
  
  if (len === 1) return 0;
  if (len <= 5) return 1;
  if (len <= 9) return 2;
  if (len <= 13) return 3;
  return 4;
}

/**
 * Split word into three parts around the ORP
 * Returns { before, pivot, after }
 */
export function splitWordAtORP(word) {
  if (!word || word.length === 0) {
    return { before: '', pivot: '', after: '' };
  }
  
  const orpIndex = calculateORP(word);
  
  return {
    before: word.slice(0, orpIndex),
    pivot: word[orpIndex] || '',
    after: word.slice(orpIndex + 1),
  };
}
