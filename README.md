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

rsvp-reader/
├── public/
│   └── (static assets)
├── src/
│   ├── components/
│   │   ├── RSVPStage.jsx       # Main word display
│   │   ├── RSVPControls.jsx    # Play/pause/speed controls
│   │   ├── SourceMap.jsx       # PDF preview with highlight
│   │   └── ContextPanel.jsx    # Shows context on pause
│   ├── lib/
│   │   ├── db.js               # Dexie database setup
│   │   ├── rsvp/
│   │   │   ├── orp.js          # ORP calculation
│   │   │   ├── timing.js       # Variable pacing
│   │   │   └── engine.js       # Core playback logic
│   │   └── workers/
│   │       ├── pdf-parser.worker.js
│   │       └── epub-parser.worker.js
│   ├── pages/
│   │   ├── Library.jsx         # Book upload + grid
│   │   └── Reader.jsx          # RSVP player
│   ├── App.jsx
│   └── main.jsx
├── vite.config.js
└── package.json
