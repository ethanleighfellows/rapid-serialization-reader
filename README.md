# 📚 RSVP Reader

A high-performance web-based speed reading application using Rapid Serial Visual Presentation (RSVP) technology. Read PDF documents faster while maintaining comprehension through scientifically-backed timing algorithms and Optimal Recognition Point (ORP) word alignment.

![License](https://img.shields.io/badge/license-All%20Rights%20Reserved-red)
![Status](https://img.shields.io/badge/status-active-success)

## 🎯 Features

### Core Reading Engine
- **RSVP Playback**: Words presented sequentially at a fixed focal point with ORP alignment
- **Variable Pacing**: Intelligent timing based on word length, punctuation, and sentence boundaries
- **Speed Control**: 100-600 WPM with presets (Study 150 WPM, Comfortable 250 WPM, Default 300 WPM, Fast 350 WPM, Skim 450 WPM)
- **Context Recovery**: Pause to see surrounding text, preventing comprehension loss

### User Experience
- **Theme System**: Light, Sepia, and Dark modes with localStorage persistence
- **Font Flexibility**: Monospace, Sans Serif, and Serif options
- **Dynamic Time Estimates**: Real-time calculation of remaining reading time per book and chapter
- **Progress Tracking**: Auto-save reading position every 5 seconds, resume from where you left off
- **Keyboard Shortcuts**: Space (play/pause), arrows (navigate), full control without mouse

### Navigation
- **5-Second Skip**: Jump forward/backward with time-based navigation
- **Sentence Navigation**: Move by sentence boundaries for comprehension recovery
- **Progress Visualization**: Real-time progress bars showing book completion percentage
- **Chapter Detection**: Automatic chapter identification with per-chapter time estimates

### Technical Foundation
- **Client-Side Only**: 100% browser-based, no backend required, works offline
- **IndexedDB Storage**: Fast local storage for books, tokens, progress, and bookmarks
- **Web Workers**: Background PDF parsing without blocking UI
- **GitHub Pages Ready**: Static deployment with zero hosting costs

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR-USERNAME/rsvp-reader.git
cd rsvp-reader

# Install dependencies
npm install

# Run development server
npm run dev

