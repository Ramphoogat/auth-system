import React, { useState } from "react";


// Image imports removed and moved to src/constants/backgrounds.ts
// BACKGROUNDS constant removed and moved to src/constants/backgrounds.ts


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

export const UserManagementRow = ({
  user,
  onRoleChange,
}: {
  user: IUser;
  onRoleChange: (userId: string, newRole: string) => Promise<void>;
}) => {
  const [isChanging, setIsChanging] = useState(false);

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-500/10 text-purple-600 border-purple-200/30";
      case "author":
        return "bg-blue-500/10 text-blue-600 border-blue-200/30";
      case "editor":
        return "bg-cyan-500/10 text-cyan-600 border-cyan-200/30";
      case "user":
      default:
        return "bg-slate-500/10 text-slate-600 border-slate-200/30";
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

  return (
    <tr className="hover:bg-white/20 transition-colors group">
      <td className="px-6 py-4">
        <div className="flex items-center">
          <img
            src={`https://unavatar.io/${encodeURIComponent(user.email)}?fallback=https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.username)}&background=random`}
            alt={user.username}
            className="w-10 h-10 rounded-full border border-white/30 object-cover shadow-md group-hover:scale-110 transition-transform duration-300 mr-3"
          />
          <span className="font-bold text-slate-800">
            {user.name || user.username}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 text-gray-800 text-sm">{user.email}</td>
      <td className="px-6 py-4">
        <span
          className={`text-[11px] font-bold px-3 py-1 rounded-full border ${getRoleColor(user.role)}`}
        >
          {user.role.toUpperCase()}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div
            className={`w-1.5 h-1.5 rounded-full mr-2 ${user.isVerified ? "bg-emerald-500" : "bg-slate-400"}`}
          ></div>
          <span
            className={`text-xs font-medium ${user.isVerified ? "text-slate-700" : "text-slate-400"}`}
          >
            {user.isVerified ? "Active" : "Unverified"}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <select
          value={user.role}
          onChange={handleRoleChange}
          disabled={isChanging}
          className="rounded px-2 py-1"
        >
          <option value="user">User</option>
          <option value="author">Author</option>
          <option value="editor">Editor</option>
          <option value="admin">Admin</option>
        </select>
      </td>
    </tr>
  );
};
