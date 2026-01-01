// Theme management with localStorage persistence
export const THEMES = {
  light: {
    name: 'Light',
    bg: 'bg-gray-50',
    cardBg: 'bg-white',
    text: 'text-gray-900',
    textSecondary: 'text-gray-600',
    border: 'border-gray-200',
    pivot: 'text-blue-600', // Changed from red to blue
  },
  sepia: {
    name: 'Sepia',
    bg: 'bg-[#f4ecd8]',
    cardBg: 'bg-[#f9f5e8]',
    text: 'text-[#5c4a3a]',
    textSecondary: 'text-[#8b7355]',
    border: 'border-[#d4c4a8]',
    pivot: 'text-[#c77700]', // Warm orange for sepia
  },
  dark: {
    name: 'Dark',
    // Professional high-contrast dark palette (AAA-friendly)
    bg: 'bg-[#070812]',        // near-black background
    cardBg: 'bg-[#0b1220]',    // dark slate card background
    text: 'text-white',        // pure white text for max contrast
    textSecondary: 'text-gray-300',
    border: 'border-[#1f2937]',
    pivot: 'text-[#60a5fa]',   // subdued cyan accent
  },
};

export function getTheme() {
  const stored = localStorage.getItem('rsvp-theme');
  const theme = stored && THEMES[stored] ? stored : 'light';

  // Apply theme attribute to document for global styling
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
  }

  return theme;
}

export function setTheme(themeName) {
  localStorage.setItem('rsvp-theme', themeName);

  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', themeName);
  }
}

export function getFont() {
  return localStorage.getItem('rsvp-font') || 'mono';
}

export function setFont(fontName) {
  localStorage.setItem('rsvp-font', fontName);
}
