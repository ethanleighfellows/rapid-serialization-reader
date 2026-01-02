// Import JSZip from npm (not CDN, since we installed it)
import JSZip from 'jszip';

self.onmessage = async (e) => {
  const { file, bookId } = e.data;
  
  console.log('[EPUB Worker] Started parsing:', file.name);
  
  try {
    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    console.log('[EPUB Worker] File read, size:', arrayBuffer.byteLength);
    
    // Load ZIP
    const zip = await JSZip.loadAsync(arrayBuffer);
    console.log('[EPUB Worker] ZIP loaded, files:', Object.keys(zip.files).length);
    
    const tokens = [];
    let tokenIdx = 0;
    let chapterNum = 0;
    
    // Find all content files (HTML/XHTML)
    const contentFiles = Object.keys(zip.files)
      .filter(name => {
        const isContent = (name.endsWith('.html') || name.endsWith('.xhtml') || name.endsWith('.htm'));
        const notNav = !name.toLowerCase().includes('nav') && !name.toLowerCase().includes('toc');
        return isContent && notNav && !zip.files[name].dir;
      })
      .sort();
    
    console.log('[EPUB Worker] Found content files:', contentFiles.length);
    
    if (contentFiles.length === 0) {
      throw new Error('No readable content found in EPUB');
    }
    
    const totalFiles = contentFiles.length;
    
    // Process each file
    for (const filename of contentFiles) {
      chapterNum++;
      console.log(`[EPUB Worker] Processing chapter ${chapterNum}/${totalFiles}: ${filename}`);
      
      try {
        // Read file content as text
        const content = await zip.files[filename].async('text');
        
        // Strip HTML and extract text
        const text = content
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/&nbsp;/gi, ' ')
          .replace(/&quot;/gi, '"')
          .replace(/&apos;/gi, "'")
          .replace(/&amp;/gi, '&')
          .replace(/&lt;/gi, '<')
          .replace(/&gt;/gi, '>')
          .replace(/\s+/g, ' ')
          .trim();
        
        if (text.length < 10) {
          console.log(`[EPUB Worker] Skipping ${filename} - too short`);
          continue;
        }
        
        // Split into words
        const words = text.split(/\s+/).filter(w => w.length > 0);
        console.log(`[EPUB Worker] Chapter ${chapterNum}: ${words.length} words`);
        
        // Add tokens
        words.forEach((word) => {
          tokens.push({
            bookId,
            tokenIdx: tokenIdx++,
            word: word.trim(),
            page: chapterNum,
            bbox: null,
          });
        });
        
      } catch (fileErr) {
        console.error(`[EPUB Worker] Error reading ${filename}:`, fileErr);
      }
      
      // Send progress update
      self.postMessage({
        type: 'progress',
        page: chapterNum,
        total: totalFiles,
      });
    }
    
    console.log(`[EPUB Worker] Complete! Total tokens: ${tokens.length}`);
    
    if (tokens.length === 0) {
      throw new Error('No text content extracted from EPUB');
    }
    
    // Send completion
    self.postMessage({
      type: 'complete',
      tokens,
      numPages: chapterNum,
      totalWords: tokens.length,
    });
    
  } catch (error) {
    console.error('[EPUB Worker] Fatal error:', error);
    self.postMessage({
      type: 'error',
      error: error.message || 'Failed to parse EPUB',
    });
  }
};
