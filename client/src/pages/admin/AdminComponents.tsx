import React, { useState } from "react";


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

export interface IAdminStats {
  totalUsers: number;
  activeUsers: number;
  securityAlerts: number;
  systemUptime: string;
}

export interface RoleUpdateResponse {
  message: string;
  user: IUser;
}

export interface ApiErrorResponse {
  message: string;
}

export interface INotification {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

export const SidebarItem = ({
  icon,
  label,
  active = false,
  isOpen,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  isOpen: boolean;
  onClick?: () => void;
}) => (
  <div
    onClick={onClick}
    className={`flex items-center ${isOpen ? "px-4" : "justify-center"} py-3 rounded-xl cursor-pointer transition-all duration-200 group ${active
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

import { FiChevronDown, FiChevronUp, FiCopy, FiCheck, FiShield } from "react-icons/fi";
import Expanded from "../../components/Expanded";

export const UserManagementRow = ({
  user,
  onRoleChange,
  allowedRoles = ["user", "author", "editor", "admin"],
  isSelected,
  onSelect,
  isExpanded: controlledIsExpanded,
  onToggleExpand,
}: {
  user: IUser;
  onRoleChange: (userId: string, newRole: string) => Promise<void>;
  allowedRoles?: string[];
  isSelected?: boolean;
  onSelect?: (userId: string) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}) => {
  const [isChanging, setIsChanging] = useState(false);
  const [localIsExpanded, setLocalIsExpanded] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);

  const isExpanded = controlledIsExpanded !== undefined ? controlledIsExpanded : localIsExpanded;

  const handleExpandToggle = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (onToggleExpand) {
      onToggleExpand();
    } else {
      setLocalIsExpanded((prev) => !prev);
    }
  };

  const copyEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(user.email);
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30";
      case "author":
        return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30";
      case "editor":
        return "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/30";
      case "user":
      default:
        return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-500/20 dark:text-gray-300 dark:border-gray-500/30";
    }
  };

  const handleRoleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value;
    if (newRole === user.role) return;

    if (
      window.confirm(
        `Are you sure you want to change ${user.username}'s role to ${newRole}?`,
      )
    ) {
      setIsChanging(true);
      try {
        await onRoleChange(user._id, newRole);
      } finally {
        setIsChanging(false);
      }
    }
  };

  const availableRoles = ["user", "author", "editor", "admin"].filter(
    (r) => allowedRoles.includes(r) || r === user.role,
  );



  return (
    <>
      <tr
        className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group border-b border-gray-100 dark:border-gray-700 last:border-0 cursor-pointer ${isExpanded ? "bg-gray-50 dark:bg-gray-800/50" : ""}`}
        onClick={handleExpandToggle}
      >
        <td className="px-4 md:px-6 py-4" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
            checked={isSelected || false}
            onChange={() => onSelect && onSelect(user._id)}
          />
        </td>
        <td className="px-4 md:px-6 py-4">
          <div className="flex items-center">
            <button
              className="mr-3 text-gray-400 hover:text-emerald-500 transition-colors"
              onClick={handleExpandToggle}
            >
              {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
            </button>
            <img
              src={
                user.email
                  ? `https://unavatar.io/${encodeURIComponent(user.email)}?fallback=${encodeURIComponent(
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user.name || user.username
                    )}&background=random`
                  )}`
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user.name || user.username
                  )}&background=random`
              }
              alt={user.username}
              className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-gray-200 dark:border-gray-600 object-cover shadow-sm group-hover:scale-110 transition-transform duration-300 mr-2 md:mr-3"
            />
            <div className="flex flex-col">
              <span className="font-bold text-gray-800 dark:text-white text-sm md:text-base">
                {user.name || user.username}
              </span>
              <div className="flex items-center space-x-2 md:hidden">
                <span className="text-[10px] text-gray-400 truncate max-w-[100px]" title={user.email}>{user.email}</span>

                <button
                  onClick={copyEmail}
                  className="text-gray-400 hover:text-emerald-500 transition-colors"
                  title="Copy Email"
                >
                  {emailCopied ? <FiCheck className="w-3 h-3 text-emerald-500" /> : <FiCopy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>
        </td>
        <td className="hidden md:table-cell px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <span className="peer truncate max-w-[150px] cursor-pointer block text-gray-900 dark:text-gray-100 font-medium hover:text-emerald-500 transition-colors">
                {user.email}
              </span>
              <div className="absolute left-0 bottom-full top-auto mb-2 opacity-0 peer-hover:opacity-100 transition-all duration-200 pointer-events-none z-[999] whitespace-nowrap transform translate-y-2 peer-hover:translate-y-0">
                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md text-gray-800 dark:text-gray-200 text-xs px-3 py-1.5 rounded-full shadow-xl border border-gray-200 dark:border-gray-700 flex items-center gap-2">
                  <span>{user.email}</span>
                </div>
              </div>
            </div>

            <button
              onClick={copyEmail}
              className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-emerald-500 transition-colors"
              title="Copy Email"
            >
              {emailCopied ? <FiCheck className="w-3 h-3 text-emerald-500" /> : <FiCopy className="w-3 h-3" />}
            </button>
          </div>
        </td>
        <td className="px-2 md:px-6 py-4">
          <span
            className={`text-[9px] md:text-[11px] font-bold px-2 md:px-3 py-1 rounded-full border ${getRoleColor(user.role)}`}
          >
            {user.role.toUpperCase()}
          </span>
        </td>
        <td className="hidden sm:table-cell px-6 py-4">
          <div className="flex items-center">
            <div
              className={`w-2 h-2 rounded-full mr-2 ${user.isVerified ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"}`}
            ></div>
            <span
              className={`text-xs font-medium ${user.isVerified ? "text-gray-700 dark:text-gray-300" : "text-gray-400 dark:text-gray-500"}`}
            >
              {user.isVerified ? "Active" : "Unverified"}
            </span>
          </div>
        </td>
        <td className="px-4 md:px-6 py-4" onClick={(e) => e.stopPropagation()}>
          {allowedRoles.length > 0 ? (
            <select
              id={`role-select-${user._id}`}
              name={`role-${user._id}`}
              aria-label="Select user role"
              value={user.role}
              onChange={handleRoleChange}
              disabled={isChanging}
              className="rounded-lg px-2 py-1 md:px-3 md:py-1.5 bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-emerald-500 text-gray-700 dark:text-gray-300 text-[10px] md:text-sm outline-none transition-all cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {availableRoles.map((role) => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-gray-400 dark:text-gray-600 text-xs flex items-center justify-end gap-1 opacity-50 cursor-not-allowed">
              <FiShield className="w-3 h-3" /> No Access
            </span>
          )}
        </td>
      </tr>
      <Expanded user={user} isExpanded={isExpanded} />
    </>
  );
};
