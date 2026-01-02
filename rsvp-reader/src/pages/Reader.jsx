self.onmessage = async (e) => {
  const { file, bookId } = e.data;
  
  try {
    // Import JSZip for reading EPUB (which is just a ZIP file)
    const JSZip = (await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm')).default;
    
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    
    const tokens = [];
    let tokenIdx = 0;
    let chapterNum = 0;
    
    // Get all HTML/XHTML files in the EPUB
    const htmlFiles = Object.keys(zip.files)
      .filter(name => 
        (name.endsWith('.html') || name.endsWith('.xhtml')) && 
        !name.includes('nav.') && 
        !name.includes('toc.')
      )
      .sort(); // Sort to maintain order
    
    const totalFiles = htmlFiles.length;
    
    for (const filename of htmlFiles) {
      chapterNum++;
      
      try {
        // Read file content
        const content = await zip.files[filename].async('text');
        
        // Remove HTML tags to get plain text
        const text = content
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove style tags
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove script tags
          .replace(/<[^>]+>/g, ' ') // Remove all HTML tags
          .replace(/&nbsp;/g, ' ') // Replace &nbsp;
          .replace(/&[a-z]+;/gi, ' ') // Replace other entities
          .replace(/\s+/g, ' ') // Normalize whitespace
          .trim();
        
        if (!text) continue;
        
        // Split into words
        const words = text
          .split(/\s+/)
          .filter(w => w.length > 0);
        
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
        
      } catch (err) {
        console.error(`Error reading ${filename}:`, err);
      }
      
      // Report progress
      self.postMessage({
        type: 'progress',
        page: chapterNum,
        total: totalFiles,
      });
    }
    
    if (tokens.length === 0) {
      throw new Error('No text content found in EPUB');
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
