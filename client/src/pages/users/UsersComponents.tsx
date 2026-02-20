import React from 'react';

export interface IUser {
  id: string;
  _id: string;
  name?: string;
  username: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  lastLogin?: string;
  lastLogout?: string;
  createdBy?: string;
}

export interface INotification {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}



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
    className={`flex items-center ${isOpen ? "px-4" : "justify-center"} py-3 rounded-xl cursor-pointer transition-all duration-200 group ${active
        ? "bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-gray-200 dark:border-gray-700"
        : "hover:bg-gray-100 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
      }`}
  >
    <div className={`${isOpen ? "mr-3" : ""} text-lg`}>{icon}</div>
    {isOpen && <span className="font-medium">{label}</span>}
    {active && isOpen && (
      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
    )}
  </div>
);

export const StatCard = ({ icon, title, value, change }: StatCardProps) => (
  <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden relative">
    <div className="flex justify-between items-start mb-4 md:mb-6 relative z-10">
      <div className="p-3 md:p-4 bg-blue-50 dark:bg-blue-500/10 rounded-2xl text-blue-600 dark:text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
        {icon}
      </div>
      <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
        {change}
      </span>
    </div>
    <div className="relative z-10">
      <h3 className="text-gray-400 dark:text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1">
        {title}
      </h3>
      <p className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white tracking-tight">
        {value}
      </p>
    </div>
  </div>
);


