import ePub from 'epubjs';

self.onmessage = async (e) => {
  const { file, bookId } = e.data;
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    const book = ePub(arrayBuffer);
    
    await book.ready;
    
    const tokens = [];
    let tokenIdx = 0;
    let chapterNum = 0;
    
    // Get spine (ordered list of content)
    const spine = await book.loaded.spine;
    
    for (const item of spine.items) {
      chapterNum++;
      
      // Load chapter content
      const doc = await item.load(book.load.bind(book));
      const textContent = doc.body.textContent;
      
      // Split into words
      const words = textContent.split(/\s+/).filter(w => w.trim());
      
      words.forEach((word) => {
        tokens.push({
          bookId,
          tokenIdx: tokenIdx++,
          word: word.trim(),
          page: chapterNum, // Use chapter as "page"
          bbox: null, // EPUB doesn't have fixed positions
        });
      });
      
      // Report progress
      self.postMessage({
        type: 'progress',
        page: chapterNum,
        total: spine.items.length,
      });
    }
    
    self.postMessage({
      type: 'complete',
      tokens,
      numPages: chapterNum,
      totalWords: tokens.length,
    });
    
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error.message,
    });
  }
};
