import React from 'react';
import { FiSun, FiMoon, FiBox, FiCommand, FiTerminal } from 'react-icons/fi';
import { useTheme } from '../context/themeContext';

const ThemeComponent: React.FC = () => {
    const { theme, setTheme, enabledThemes } = useTheme();

    return (
        <div className={`flex rounded-full p-1 border shadow-inner w-fit transition-all duration-500 ${theme === 'brutalist'
            ? 'bg-yellow-200 border-black ring-2 ring-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
            : theme === 'macos'
                ? 'bg-white/20 backdrop-blur-xl border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.1)]'
                : theme === 'terminal'
                    ? 'bg-black border-green-500 shadow-[0_0_10px_rgba(0,255,0,0.5)]'
                    : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            }`}>
            <button
                onClick={() => setTheme('light')}
                className={`theme-switch p-2 rounded-full transition-all duration-300 flex items-center justify-center ${theme === 'light'
                    ? 'bg-white text-amber-500 shadow-sm transform scale-105'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 terminal:text-green-700'
                    }`}
                aria-label="Light Mode"
                title="Light Mode"
            >
                <FiSun className="w-4 h-4" />
            </button>
            <button
                onClick={() => setTheme('dark')}
                className={`theme-switch p-2 rounded-full transition-all duration-300 flex items-center justify-center ${theme === 'dark'
                    ? 'bg-gray-700 text-blue-400 shadow-sm transform scale-105'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 terminal:text-green-700'
                    }`}
                aria-label="Dark Mode"
                title="Dark Mode"
            >
                <FiMoon className="w-4 h-4" />
            </button>

            {enabledThemes.brutalist && (
                <button
                    onClick={() => setTheme('brutalist')}
                    className={`theme-switch p-2 rounded-full transition-all duration-300 flex items-center justify-center ${theme === 'brutalist'
                        ? 'bg-black text-yellow-400 border border-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transform scale-105'
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                        }`}
                    aria-label="Brutalist Mode"
                    title="Brutalist Mode"
                >
                    <FiBox className="w-4 h-4" />
                </button>
            )}

            {enabledThemes.macos && (
                <button
                    onClick={() => setTheme('macos')}
                    className={`theme-switch p-2 rounded-full transition-all duration-500 flex items-center justify-center ${theme === 'macos'
                        ? 'bg-gradient-to-br from-gray-100 to-white text-black shadow-lg transform scale-110 ring-1 ring-black/5'
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                        }`}
                    aria-label="MacOS Mode"
                    title="MacOS Mode"
                >
                    <FiCommand className="w-4 h-4" />
                </button>
            )}

            {enabledThemes.terminal && (
                <button
                    onClick={() => setTheme('terminal')}
                    className={`theme-switch p-2 rounded-full transition-all duration-300 flex items-center justify-center ${theme === 'terminal'
                        ? 'bg-green-900/20 text-green-500 shadow-[0_0_8px_rgba(0,255,0,0.6)] transform scale-105 border border-green-500'
                        : 'text-gray-400 hover:text-green-500'
                        }`}
                    aria-label="Terminal Mode"
                    title="Terminal Mode"
                >
                    <FiTerminal className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};

export default ThemeComponent;
