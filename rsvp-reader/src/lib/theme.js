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
    bg: 'bg-gray-900',
    cardBg: 'bg-gray-800',
    text: 'text-gray-100',
    textSecondary: 'text-gray-400',
    border: 'border-gray-700',
    pivot: 'text-cyan-400', // Cyan for dark mode
  },
};

export function getTheme() {
  const stored = localStorage.getItem('rsvp-theme');
  return stored && THEMES[stored] ? stored : 'light';
}

export function setTheme(themeName) {
  localStorage.setItem('rsvp-theme', themeName);
}

export function getFont() {
  return localStorage.getItem('rsvp-font') || 'mono';
}

export function setFont(fontName) {
  localStorage.setItem('rsvp-font', fontName);
}
