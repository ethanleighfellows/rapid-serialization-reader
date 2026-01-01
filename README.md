# rapid-serialization-reader

┌─────────────────────────────────────────────────────────────┐
│  Vite React App (Pure Client-Side)                         │
├─────────────────────────────────────────────────────────────┤
│  Routes (HashRouter):                                       │
│  - /#/library          → Upload + book grid                │
│  - /#/reader/:bookId   → RSVP player                       │
│                                                             │
│  Core Logic (all in browser):                              │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Web Worker: PDF/EPUB Parser                         │  │
│  │  - Receives file via postMessage                    │  │
│  │  - Extracts tokens + coordinates                    │  │
│  │  - Stores in IndexedDB via Dexie                    │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Main Thread: RSVP Engine                            │  │
│  │  - Reads tokens from Dexie                          │  │
│  │  - Calculates ORP + timing                          │  │
│  │  - Renders at 60fps via requestAnimationFrame       │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  IndexedDB (Dexie):                                         │
│  - books: {id, title, file, metadata}                      │
│  - tokens: {bookId, idx, word, page, bbox}                 │
│  - progress: {bookId, tokenIdx, timestamp}                 │
│  - bookmarks: {bookId, tokenIdx, note}                     │
└─────────────────────────────────────────────────────────────┘
