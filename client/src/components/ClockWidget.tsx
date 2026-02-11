import React, { useState, useEffect } from 'react';

const ClockWidget: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const getCalendarDays = () => {
    const year = time.getFullYear();
    const month = time.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    // Previous month empty slots
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const days = getCalendarDays();
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div 
      className="absolute top-8 right-0 w-[280px] macos-glass-dark rounded-2xl shadow-2xl overflow-hidden z-[110] border border-white/10 animate-in fade-in slide-in-from-top-1 duration-200 p-4"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Clock Section */}
      <div className="text-center mb-6">
        <h2 className="text-5xl font-light text-white tracking-tight">
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
        </h2>
        <p className="text-blue-400 text-sm font-medium mt-1">
          {formatDate(time)}
        </p>
      </div>

      {/* Calendar Section */}
      <div className="bg-white/5 rounded-xl p-3 border border-white/5">
        <div className="flex justify-between items-center mb-3 px-1">
          <span className="text-white text-xs font-bold uppercase tracking-wider">
            {time.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
        </div>
        
        <div className="grid grid-cols-7 gap-1 text-center">
          {weekDays.map((day) => (
            <div key={day} className="text-[10px] text-white/40 font-bold py-1">
              {day}
            </div>
          ))}
          {days.map((day, idx) => (
            <div 
              key={idx} 
              className={`text-[12px] py-1 rounded-md transition-colors ${
                day === time.getDate() 
                  ? 'bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/20' 
                  : day 
                    ? 'text-white/80 hover:bg-white/10 cursor-default' 
                    : ''
              }`}
            >
              {day}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-[11px] text-white/40 font-medium">
        <span>Premium OS Systems</span>
        <span className="text-blue-400">Settings</span>
      </div>
    </div>
  );
};

export default ClockWidget;
