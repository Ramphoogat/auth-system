import React from 'react';
import { FiCheckCircle } from 'react-icons/fi';

// Interfaces for props
export interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  change: string;
}

export interface AppearanceCardProps {
  bg: { id: string; name: string; image: string };
  currentBg: string;
  handleBgChange: (image: string) => void;
}

export interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  isOpen: boolean;
  onClick?: () => void;
}

export const SidebarItem = ({
  icon,
  label,
  active = false,
  isOpen,
  onClick,
}: SidebarItemProps) => (
  <div
    onClick={onClick}
    className={`flex items-center ${isOpen ? "px-4" : "justify-center"} py-3 rounded-xl cursor-pointer transition-all duration-200 group ${
      active
        ? "bg-white/40 text-black shadow-lg border border-white/20"
        : "hover:bg-white/20 text-gray-700 hover:text-black"
    }`}
  >
    <div className={`${isOpen ? "mr-3" : ""} text-lg`}>{icon}</div>
    {isOpen && <span className="font-medium">{label}</span>}
    {active && isOpen && (
      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-black"></div>
    )}
  </div>
);

export const StatCard = ({ icon, title, value, change }: StatCardProps) => (
  <div className="bg-white/50 backdrop-blur-xl p-6 rounded-3xl border border-white/30 shadow-xl hover:bg-white/70 transition-all duration-300 group">
    <div className="flex justify-between items-start mb-6">
      <div className="p-3 bg-white/40 rounded-2xl text-slate-600 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
        {icon}
      </div>
      <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-blue-500/10 text-blue-600">
        {change}
      </span>
    </div>
    <div>
      <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
        {title}
      </h3>
      <p className="text-2xl font-bold text-slate-800 tracking-tight">
        {value}
      </p>
    </div>
  </div>
);

export const AppearanceCard = ({ bg, currentBg, handleBgChange }: AppearanceCardProps) => (
  <div
    onClick={() => handleBgChange(bg.image)}
    className={`group relative h-48 rounded-2xl overflow-hidden cursor-pointer border-2 transition-all duration-500 ${
      currentBg === bg.image
        ? "border-blue-500 ring-[6px] ring-blue-500/20 scale-[1.02]"
        : "border-white/30 hover:border-white/60 hover:scale-[1.01]"
    }`}
  >
    <img
      src={bg.image}
      alt={bg.name}
      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
      <div>
        <p className="text-white text-xs font-medium uppercase tracking-wider mb-1 opacity-70">
          Background
        </p>
        <p className="text-white text-sm font-bold">{bg.name}</p>
      </div>
    </div>
    {currentBg === bg.image && (
      <div className="absolute top-3 right-3 bg-blue-500 text-white p-2 rounded-full shadow-lg border border-white/20">
        <FiCheckCircle className="w-4 h-4" />
      </div>
    )}
  </div>
);
