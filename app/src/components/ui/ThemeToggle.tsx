import { useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

type Theme = 'dark' | 'light' | 'system';

const STORAGE_KEY = 'amarktai_theme';

function getSystemTheme(): 'dark' | 'light' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  const resolved = theme === 'system' ? getSystemTheme() : theme;
  if (resolved === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    return stored && ['dark', 'light', 'system'].includes(stored) ? stored : 'dark';
  });

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  // Listen for system preference changes when in system mode
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const cycle = () => {
    setTheme((prev) => {
      if (prev === 'dark') return 'light';
      if (prev === 'light') return 'system';
      return 'dark';
    });
  };

  const icon =
    theme === 'dark' ? (
      <Moon className="w-5 h-5" />
    ) : theme === 'light' ? (
      <Sun className="w-5 h-5" />
    ) : (
      <Monitor className="w-5 h-5" />
    );

  const label =
    theme === 'dark' ? 'Dark mode' : theme === 'light' ? 'Light mode' : 'System theme';

  return (
    <button
      onClick={cycle}
      className="p-2 text-[#9AA3B8] hover:text-white transition-colors rounded-lg hover:bg-white/5"
      aria-label={label}
      title={label}
    >
      {icon}
    </button>
  );
}
