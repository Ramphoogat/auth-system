import React, { useState } from 'react';

const ControlCenter: React.FC = () => {
  const [wifi, setWifi] = useState(true);
  const [bluetooth, setBluetooth] = useState(true);
  const [airdrop, setAirdrop] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [brightness, setBrightness] = useState(80);
  const [sound, setSound] = useState(65);

  return (
    <div 
      className="absolute top-8 right-4 w-[320px] macos-glass-dark rounded-2xl shadow-2xl p-4 z-[110] border border-white/10 animate-in fade-in zoom-in-95 duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Top Grid: Wifi, BT, Airdrop */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-white/10 rounded-xl p-3 flex flex-col justify-between h-24 border border-white/5">
          <div className="flex items-center space-x-2">
            <div 
              onClick={() => setWifi(!wifi)}
              className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-colors ${wifi ? 'bg-blue-500 text-white' : 'bg-white/20 text-white/70'}`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-white">Wi-Fi</span>
              <span className="text-[11px] text-white/50">{wifi ? 'Home_5G' : 'Off'}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-auto">
             <div 
              onClick={() => setBluetooth(!bluetooth)}
              className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-colors ${bluetooth ? 'bg-blue-500 text-white' : 'bg-white/20 text-white/70'}`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6.5 6.5l11 11L12 23V1l5.5 5.5-11 11" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-white">Bluetooth</span>
              <span className="text-[11px] text-white/50">{bluetooth ? 'On' : 'Off'}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="bg-white/10 rounded-xl p-3 flex items-center space-x-3 border border-white/5 flex-1">
             <div 
              onClick={() => setAirdrop(!airdrop)}
              className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-colors ${airdrop ? 'bg-blue-500 text-white' : 'bg-white/20 text-white/70'}`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="3" />
                <path d="M16 8l4 4-4 4M8 16l-4-4 4-4" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-white">AirDrop</span>
              <span className="text-[11px] text-white/50">{airdrop ? 'Contacts Only' : 'Off'}</span>
            </div>
          </div>
          
          <div 
            onClick={() => setDarkMode(!darkMode)}
            className="bg-white/10 rounded-xl p-3 flex items-center space-x-3 border border-white/5 flex-1 cursor-pointer hover:bg-white/20 transition-colors"
          >
             <div className="w-7 h-7 rounded-full flex items-center justify-center bg-white/20 text-white/70">
              {darkMode ? (
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-white">{darkMode ? 'Dark Mode' : 'Light Mode'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sliders Area */}
      <div className="bg-white/10 rounded-xl p-4 mb-3 border border-white/5">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[13px] font-bold text-white">Display</span>
            <span className="text-[11px] text-white/50">{brightness}%</span>
          </div>
          <div className="relative h-6 bg-white/10 rounded-lg overflow-hidden group">
            <div 
              className="absolute left-0 top-0 h-full bg-white transition-all duration-300" 
              style={{ width: `${brightness}%` }}
            />
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={brightness} 
              onChange={(e) => setBrightness(parseInt(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className={`w-3.5 h-3.5 ${brightness > 50 ? 'text-black/50' : 'text-white/50'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[13px] font-bold text-white">Sound</span>
            <span className="text-[11px] text-white/50">{sound}%</span>
          </div>
          <div className="relative h-6 bg-white/10 rounded-lg overflow-hidden group">
            <div 
              className="absolute left-0 top-0 h-full bg-white transition-all duration-300" 
              style={{ width: `${sound}%` }}
            />
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={sound} 
              onChange={(e) => setSound(parseInt(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className={`w-3.5 h-3.5 ${sound > 50 ? 'text-black/50' : 'text-white/50'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* System Info & Battery */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/10 rounded-xl p-3 border border-white/5 text-white">
          <div className="flex items-center space-x-2 mb-1">
            <svg className="w-3.5 h-3.5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M7 20v-2M17 20v-2M9 4v2M15 4v2M3 10h18" />
            </svg>
            <span className="text-[11px] font-bold">System</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-white/50">CPU: 12%</span>
            <span className="text-[10px] text-white/50">RAM: 4.2 GB</span>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-3 border border-white/5 text-white">
          <div className="flex items-center space-x-2 mb-1">
            <svg className="w-3.5 h-3.5 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="16" height="10" rx="2" />
              <path d="M22 11v2" strokeLinecap="round" />
            </svg>
            <span className="text-[11px] font-bold">Battery</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[13px] font-bold">85%</span>
            <span className="text-[10px] text-white/50">Power: Air</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlCenter;
