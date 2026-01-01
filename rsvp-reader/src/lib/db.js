import Dexie from 'dexie';

// Initialize Dexie database
export const db = new Dexie('RSVPReaderDB');

// Define schema (version 1)
db.version(1).stores({
  books: '++id, title, author, fileName, fileType, uploadedAt',
  tokens: '++id, bookId, tokenIdx, word, page, bbox',
  progress: 'bookId, tokenIdx, timestamp',
  bookmarks: '++id, bookId, tokenIdx, note, createdAt',
});

// ========================================
// Helper functions for common queries
// ========================================

// Books
export const getAllBooks = () => db.books.toArray();
export const getBook = (id) => db.books.get(id);
export const addBook = (bookData) => db.books.add(bookData);
export const deleteBook = async (id) => {
  await db.tokens.where('bookId').equals(id).delete();
  await db.progress.where('bookId').equals(id).delete();
  await db.bookmarks.where('bookId').equals(id).delete();
  await db.books.delete(id);
};

// Tokens
export const getTokens = (bookId) => 
  db.tokens.where('bookId').equals(bookId).sortBy('tokenIdx');

export const getTokenRange = (bookId, startIdx, endIdx) =>
  db.tokens
    .where(['bookId', 'tokenIdx'])
    .between([bookId, startIdx], [bookId, endIdx])
    .toArray();

export const addTokens = (tokens) => db.tokens.bulkAdd(tokens);

export const getTokenCount = (bookId) =>
  db.tokens.where('bookId').equals(bookId).count();

// Progress
export const saveProgress = (bookId, tokenIdx) => 
  db.progress.put({ 
    bookId, 
    tokenIdx, 
    timestamp: Date.now() 
  });

export const getProgress = (bookId) =>
  db.progress.get(bookId);

// Bookmarks
export const addBookmark = (bookId, tokenIdx, note = '') =>
  db.bookmarks.add({
    bookId,
    tokenIdx,
    note,
    createdAt: Date.now(),
  });

export const getBookmarks = (bookId) =>
  db.bookmarks.where('bookId').equals(bookId).toArray();

export const deleteBookmark = (id) =>
  db.bookmarks.delete(id);
