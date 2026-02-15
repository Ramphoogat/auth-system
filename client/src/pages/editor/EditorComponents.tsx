import React from 'react';

export interface IUser {
  _id: string;
  name?: string;
  username: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

export interface IAdminStats {
  totalUsers: number;
  activeUsers: number;
  securityAlerts: number;
  systemUptime: string;
}

export interface INotification {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

import { FiCheckCircle } from 'react-icons/fi';

// Interfaces for props
export interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  change: string;
}

export interface ReaderCardProps {
  client: {
    _id: string;
    name?: string;
    username: string;
    email: string;
    role: string;
  };
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
        ? "bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-gray-200 dark:border-gray-700"
        : "hover:bg-gray-100 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
    }`}
  >
    <div className={`${isOpen ? "mr-3" : ""} text-lg`}>{icon}</div>
    {isOpen && <span className="font-medium text-sm font-semibold">{label}</span>}
    {active && isOpen && (
      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
    )}
  </div>
);

export const StatCard = ({ icon, title, value, change }: StatCardProps) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 group">
    <div className="flex justify-between items-start mb-6">
      <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
        {icon}
      </div>
      <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
        {change}
      </span>
    </div>
    <div>
      <h3 className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">
        {title}
      </h3>
      <p className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">
        {value}
      </p>
    </div>
  </div>
);

export const ReaderCard = ({ client }: ReaderCardProps) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-[28px] border border-gray-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 group">
    <div className="flex flex-col items-center text-center">
      <img
        src={`https://unavatar.io/${encodeURIComponent(client.email)}`}
        className="w-16 h-16 rounded-full border-2 border-white dark:border-gray-600 mb-2 object-cover shadow-sm"
        alt={client.username}
      />
      <h3 className="text-sm font-bold text-gray-800 dark:text-white">
        {client.name || client.username}
      </h3>
      <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2">
        {client.email}
      </p>
      <span
        className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider border ${
          client.role === "author"
            ? "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30"
            : client.role === "editor"
              ? "bg-cyan-100 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/30"
              : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600"
        }`}
      >
        {client.role}
      </span>
    </div>
  </div>
);

export const AppearanceCard = ({ bg, currentBg, handleBgChange }: AppearanceCardProps) => (
  <div
    onClick={() => handleBgChange(bg.image)}
    className={`group relative h-48 rounded-2xl overflow-hidden cursor-pointer border-2 transition-all duration-500 ${
      currentBg === bg.image
        ? "border-emerald-500 ring-[6px] ring-emerald-500/20 scale-[1.02]"
        : "border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-500/50 hover:scale-[1.01]"
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
      <div className="absolute top-3 right-3 bg-emerald-500 text-white p-2 rounded-full shadow-lg border border-white/20">
        <FiCheckCircle className="w-4 h-4" />
      </div>
    )}
  </div>
);
