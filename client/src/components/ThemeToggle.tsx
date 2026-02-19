import { FiSun, FiMoon, FiBox, FiCommand, FiTerminal } from 'react-icons/fi';
import { useTheme } from '../context/themeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`theme-switch relative p-2.5 rounded-2xl transition-all duration-500 group overflow-hidden ${theme === 'light'
        ? 'bg-gray-100 text-amber-500 hover:bg-amber-50 shadow-sm border border-gray-200'
        : theme === 'dark'
          ? 'bg-gray-800 text-blue-400 hover:bg-gray-700 shadow-lg border border-gray-700'
          : theme === 'brutalist'
            ? 'bg-yellow-300 text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-none' // Brutalist styles
            : theme === 'macos'
              ? 'bg-white/50 backdrop-blur-xl border border-white/40 shadow-xl text-gray-800 hover:scale-105 active:scale-95 ring-1 ring-black/5' // MacOS styles
              : 'bg-black border border-green-500 shadow-[0_0_10px_rgba(0,255,0,0.5)] text-green-500 hover:text-green-400 rounded-none' // Terminal styles
        }`}
      aria-label="Toggle Theme"
    >
      <div className="relative z-10 flex items-center justify-center">
        {theme === 'light' && (
          <FiSun className="w-5 h-5 transition-transform duration-500 group-hover:rotate-[180deg] group-hover:scale-110" />
        )}
        {theme === 'dark' && (
          <FiMoon className="w-5 h-5 transition-transform duration-500 group-hover:rotate-[12deg] group-hover:scale-110" />
        )}
        {theme === 'brutalist' && (
          <FiBox className="w-5 h-5 transition-transform duration-500 group-hover:rotate-[180deg] group-hover:scale-110" />
        )}
        {theme === 'macos' && (
          <FiCommand className="w-5 h-5 transition-transform duration-700 ease-in-out group-hover:scale-110" />
        )}
        {theme === 'terminal' && (
          <FiTerminal className="w-5 h-5 transition-transform duration-500 group-hover:scale-110" />
        )}
      </div>

      {/* Decorative background pulse */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${theme === 'light' ? 'bg-amber-400/10' : theme === 'macos' ? 'bg-white/30' : theme === 'terminal' ? 'bg-green-500/10' : 'bg-blue-400/10'
        }`} />
    </button>
  );
};

export default ThemeToggle;
