import React, { useEffect, useState, useRef } from 'react';
import IllustrationPanel from './IllustrationPanel';
import AuthForm from './AuthForm';
import '../auth.css';

const THEME_KEY = 'pref-theme';

const AuthLayout: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(THEME_KEY) : null;
    if (stored === 'light' || stored === 'dark') return stored;
    const prefersDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  });

  const innerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const el = innerRef.current?.querySelector('.auth-form-inner');
    if (el) {
      el.classList.add('pre-enter');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.classList.remove('pre-enter');
          el.classList.add('entered');
        });
      });
    }
  }, []);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <div className="auth-shell" ref={innerRef}>
      <button className="theme-toggle" onClick={toggleTheme} aria-label="Cambiar tema" title="Cambiar tema">
        {theme === 'dark' ? '🌞' : '🌙'}
      </button>
      <IllustrationPanel />
      <AuthForm />
    </div>
  );
};

export default AuthLayout;
