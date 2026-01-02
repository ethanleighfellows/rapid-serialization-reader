self.onmessage = async (e) => {
  const { file, bookId } = e.data;
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // Use JSZip to extract EPUB (EPUBs are just ZIP files)
    // We'll parse it manually since epubjs has issues in workers
    
    // For now, let's use a simpler approach with epub.js
    const { default: ePub } = await import('epubjs');
    
    const book = ePub(arrayBuffer);
    await book.opened;
    
    const tokens = [];
    let tokenIdx = 0;
    let chapterNum = 0;
    
    // Get all spine items (chapters)
    const spine = book.spine.items;
    const totalChapters = spine.length;
    
    for (const item of spine) {
      chapterNum++;
      
      try {
        // Load the chapter content
        await item.load(book.load.bind(book));
        
        // Get text content from the document
        const doc = item.document;
        if (!doc || !doc.body) continue;
        
        // Extract all text from body
        const text = doc.body.textContent || doc.body.innerText || '';
        
        // Split into words and clean
        const words = text
          .split(/\s+/)
          .map(w => w.trim())
          .filter(w => w.length > 0);
        
        // Add each word as a token
        words.forEach((word) => {
          tokens.push({
            bookId,
            tokenIdx: tokenIdx++,
            word: word,
            page: chapterNum, // Use chapter number as "page"
            bbox: null, // EPUB doesn't have fixed positions
          });
        });
        
        // Unload to free memory
        item.unload();
        
      } catch (err) {
        console.error(`Error parsing chapter ${chapterNum}:`, err);
      }
      
      // Report progress
      self.postMessage({
        type: 'progress',
        page: chapterNum,
        total: totalChapters,
      });
    }
    
    self.postMessage({
      type: 'complete',
      tokens,
      numPages: chapterNum,
      totalWords: tokens.length,
    });
    
  } catch (error) {
    console.error('EPUB parse error:', error);
    self.postMessage({
      type: 'error',
      error: error.message || 'Failed to parse EPUB',
    });
  }
};
