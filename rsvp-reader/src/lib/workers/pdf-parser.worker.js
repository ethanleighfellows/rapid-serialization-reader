import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

self.onmessage = async (e) => {
  const { file, bookId } = e.data;
  
  try {
    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    const tokens = [];
    let tokenIdx = 0;
    
    // Parse each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const viewport = page.getViewport({ scale: 1.0 });
      
      // Process each text item
      for (const item of textContent.items) {
        // Skip empty items
        if (!item.str || !item.str.trim()) continue;
        
        // Split by whitespace but preserve structure
        const words = item.str.split(/\s+/);
        const itemWidth = item.width;
        const avgWordWidth = itemWidth / words.length;
        
        words.forEach((word, wordIdx) => {
          if (!word.trim()) return;
          
          tokens.push({
            bookId,
            tokenIdx: tokenIdx++,
            word: word.trim(),
            page: pageNum,
            bbox: {
              x: item.transform[4] + (avgWordWidth * wordIdx),
              y: viewport.height - item.transform[5],
              width: avgWordWidth,
              height: item.height,
            },
          });
        });
      }
      
      // Report progress
      self.postMessage({
        type: 'progress',
        page: pageNum,
        total: pdf.numPages,
      });
    }
    
    // Send complete tokens
    self.postMessage({
      type: 'complete',
      tokens,
      numPages: pdf.numPages,
      totalWords: tokens.length,
    });
    
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error.message,
    });
  }
};
