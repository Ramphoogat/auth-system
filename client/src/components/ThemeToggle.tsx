import React from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../context/themeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative p-2.5 rounded-2xl transition-all duration-500 group overflow-hidden ${
        theme === 'light' 
          ? 'bg-gray-100 text-amber-500 hover:bg-amber-50 shadow-sm border border-gray-200' 
          : 'bg-gray-800 text-blue-400 hover:bg-gray-700 shadow-lg border border-gray-700'
      }`}
      aria-label="Toggle Theme"
    >
      <div className="relative z-10 flex items-center justify-center">
        {theme === 'light' ? (
          <FiMoon className="w-5 h-5 transition-transform duration-500 group-hover:rotate-[360deg] group-hover:scale-110" />
        ) : (
          <FiSun className="w-5 h-5 transition-transform duration-500 group-hover:rotate-[360deg] group-hover:scale-110" />
        )}
      </div>
      
      {/* Decorative background pulse */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
        theme === 'light' ? 'bg-amber-400/10' : 'bg-blue-400/10'
      }`} />
    </button>
  );
};

export default ThemeToggle;
