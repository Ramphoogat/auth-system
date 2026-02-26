import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { FiCpu, FiShield, FiLock, FiCheckCircle, FiTerminal, FiRefreshCw } from "react-icons/fi";
import { useToast } from "./ToastProvider";
import { useTheme } from "../context/themeContext";
import { logActivity } from "../utils/activityLogger";

interface SystemSettings {
  roleSystemEnabled: boolean;
  governanceMode: "MODE_1" | "MODE_2" | "MODE_3";
}

const Settings: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get("/settings");
        setSettings(res.data);
      } catch (err) {
        console.error("Failed to load settings", err);
        showError("Failed to load system settings");
      }
    };
    fetchSettings();
  }, [showError]);

  const handleToggleSystem = async (enabled: boolean) => {
    try {
      const res = await api.patch("/settings/toggle", { enabled });
      setSettings((prev) => prev ? { ...prev, roleSystemEnabled: enabled } : null);
      showSuccess(res.data.message);
      logActivity("UPDATE", "Settings", `Role System ${enabled ? 'Enabled' : 'Disabled'}`);
    } catch (err) {
      console.error("Toggle system error:", err);
      showError("Failed to update role system status");
    }
  };

  const handleModeChange = async (mode: "MODE_1" | "MODE_2" | "MODE_3") => {
    try {
      const res = await api.patch("/settings/mode", { mode });
      setSettings((prev) => prev ? { ...prev, governanceMode: mode } : null);
      showSuccess(res.data.message);
      logActivity("UPDATE", "Settings", `Governance Mode changed to ${mode}`);
    } catch (err) {
      console.error("Mode change error:", err);
      showError("Failed to update governance mode");
    }
  };

  if (!settings) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-4xl font-black dark:text-white tracking-tight mb-2">System Settings</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Configure role governance and system-wide security policies.
        </p>
      </div>

      {/* Role System Toggle */}
      <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-[32px] border border-gray-200 dark:border-gray-700 shadow-xl transition-all duration-300 hover:shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-0">
          <div className="flex items-center space-x-4">
            <div className={`p-3 md:p-4 rounded-2xl shrink-0 ${settings.roleSystemEnabled ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
              <FiShield className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">Role Governance System</h2>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Enable or disable dynamic role management</p>
            </div>
          </div>

          <button
            onClick={() => handleToggleSystem(!settings.roleSystemEnabled)}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none self-end md:self-auto ${settings.roleSystemEnabled ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"
              }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 ${settings.roleSystemEnabled ? "translate-x-7" : "translate-x-1"
                }`}
            />
          </button>
        </div>
      </div>

      {/* Governance Modes */}
      <div className={`space-y-6 transition-opacity duration-300 ${settings.roleSystemEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 px-2 flex items-center">
          <FiCpu className="mr-2" /> Governance Model
        </h3>

        <div
          className="grid grid-cols-1 md:[grid-template-columns:repeat(3,1fr)] md:[grid-template-rows:repeat(1,1fr)] gap-6 overflow-visible px-[5px]"
        >
          {/* Mode 1 */}
          <div
            onClick={() => handleModeChange("MODE_1")}
            style={{ paddingLeft: '24px', paddingRight: '24px' }}
            className={`relative cursor-pointer group p-5 md:p-6 rounded-3xl border-2 transition-all duration-300 ${settings.governanceMode === "MODE_1"
              ? "bg-white dark:bg-gray-800 border-emerald-500 shadow-xl ring-2 ring-emerald-500"
              : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 hover:border-emerald-300 dark:hover:border-emerald-500/50"
              }`}
          >
            {settings.governanceMode === "MODE_1" && (
              <div className="absolute top-4 right-4 text-emerald-500">
                <FiCheckCircle className="w-5 h-5 md:w-6 md:h-6" />
              </div>
            )}
            <div className="mb-4 p-2.5 md:p-3 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-2xl w-fit">
              <FiLock className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h4 className="text-base md:text-lg font-bold text-gray-900 dark:text-white mb-2">Centralized Control</h4>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-4 font-medium uppercase tracking-wider">Mode 1 (Default)</p>
            <ul className="text-xs md:text-sm text-gray-600 dark:text-gray-300 space-y-2">
              <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 mr-2 shrink-0" />Admin -&gt; Everyone</li>
              <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 mr-2 shrink-0" />No delegation power</li>
            </ul>
          </div>

          {/* Mode 2 */}
          <div
            onClick={() => handleModeChange("MODE_2")}
            style={{ paddingLeft: '24px', paddingRight: '24px' }}
            className={`relative cursor-pointer group p-5 md:p-6 rounded-3xl border-2 transition-all duration-300 ${settings.governanceMode === "MODE_2"
              ? "bg-white dark:bg-gray-800 border-emerald-500 shadow-xl ring-2 ring-emerald-500"
              : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 hover:border-emerald-300 dark:hover:border-emerald-500/50"
              }`}
          >
            {settings.governanceMode === "MODE_2" && (
              <div className="absolute top-4 right-4 text-emerald-500">
                <FiCheckCircle className="w-5 h-5 md:w-6 md:h-6" />
              </div>
            )}
            <div className="mb-4 p-2.5 md:p-3 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-2xl w-fit">
              <FiLock className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h4 className="text-base md:text-lg font-bold text-gray-900 dark:text-white mb-2">Strict Hierarchy</h4>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-4 font-medium uppercase tracking-wider">Mode 2</p>
            <ul className="text-xs md:text-sm text-gray-600 dark:text-gray-300 space-y-2">
              <li className="flex items-center text-emerald-600 dark:text-emerald-400 font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 shrink-0" />Admin: Author → Admin</li>
              <li className="flex items-center text-blue-600 dark:text-blue-400 font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 shrink-0" />Author: Editor → Author</li>
              <li className="flex items-center text-cyan-600 dark:text-cyan-400 font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mr-2 shrink-0" />Editor: User → Editor</li>
            </ul>
          </div>

          {/* Mode 3 */}
          <div
            onClick={() => handleModeChange("MODE_3")}
            style={{ paddingLeft: '24px', paddingRight: '24px' }}
            className={`relative cursor-pointer group p-5 md:p-6 rounded-3xl border-2 transition-all duration-300 ${settings.governanceMode === "MODE_3"
              ? "bg-white dark:bg-gray-800 border-emerald-500 shadow-xl ring-2 ring-emerald-500"
              : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 hover:border-emerald-300 dark:hover:border-emerald-500/50"
              }`}
          >
            {settings.governanceMode === "MODE_3" && (
              <div className="absolute top-4 right-4 text-emerald-500">
                <FiCheckCircle className="w-5 h-5 md:w-6 md:h-6" />
              </div>
            )}
            <div className="mb-4 p-2.5 md:p-3 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-2xl w-fit">
              <FiLock className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h4 className="text-base md:text-lg font-bold text-gray-900 dark:text-white mb-2">Layered Delegation</h4>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-4 font-medium uppercase tracking-wider">Mode 3</p>
            <ul className="text-xs md:text-sm text-gray-600 dark:text-gray-300 space-y-2">
              <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 mr-2 shrink-0" />Admin -&gt; Everyone</li>
              <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 mr-2 shrink-0" />Author -&gt; Editor, User</li>
              <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 mr-2 shrink-0" />Editor -&gt; User</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Advanced Theme & Features */}
      <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-[32px] border border-gray-200 dark:border-gray-700 shadow-xl transition-all duration-300 hover:shadow-2xl">
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FiCheckCircle className="text-indigo-500" />
            Advanced UI Features
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Enable experimental or specialized visual themes.</p>
        </div>

        <div className="space-y-4">
          <ThemeFeatureToggle
            label="Neo-Brutalist Theme"
            description="High contrast, bold borders, unpolished aesthetic."
            feature="brutalist"
          />
          <ThemeFeatureToggle
            label="MacOS Glassmorphism"
            description="Frosted glass, blur effects, and smooth animations."
            feature="macos"
          />
          <ThemeFeatureToggle
            label="Hacker Terminal Mode"
            description="Monospace fonts, green text on black, scanlines."
            feature="terminal"
          />
        </div>
      </div>

      {/* System Activity Console */}
      <SystemConsole />
    </div>
  );
};

// Helper component for theme toggles
const ThemeFeatureToggle: React.FC<{ label: string; description: string; feature: "brutalist" | "macos" | "terminal" }> = ({ label, description, feature }) => {
  const { enabledThemes, toggleThemeFeature } = useTheme();
  const isEnabled = enabledThemes[feature];

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-600">
      <div>
        <h3 className="font-bold text-gray-800 dark:text-gray-200">{label}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <button
        onClick={() => toggleThemeFeature(feature)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${isEnabled ? "bg-indigo-500" : "bg-gray-300 dark:bg-gray-600"
          }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${isEnabled ? "translate-x-6" : "translate-x-1"
            }`}
        />
      </button>
    </div>
  );
};

// System Activity Console Component
interface LogEntry {
  _id: string;
  action: string;
  module: string;
  description: string;
  createdAt: string;
  user?: {
    username: string;
    email?: string;
    role?: string;
  };
}

const SystemConsole: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get("/activity");
      setLogs(res.data);
    } catch (error) {
      console.error("Failed to fetch activity logs", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();

    const interval = setInterval(() => {
      fetchLogs();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  function getActionColor(action: string) {
    switch (action.toUpperCase()) {
      case "DELETE":
      case "REMOVE":
        return "text-red-400";
      case "CREATE":
      case "ADD":
        return "text-emerald-400";
      case "UPDATE":
      case "EDIT":
        return "text-blue-400";
      default:
        return "text-orange-400";
    }
  }

  return (
    <div className="bg-gray-900 md:p-8 p-6 rounded-[32px] shadow-2xl border border-gray-800 flex flex-col pt-8 relative overflow-hidden group">
      {/* Decorative scanline and gradient top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-300 to-emerald-500 opacity-70"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

      <div className="flex items-center justify-between mb-6 z-10 relative">
        <h2 className="text-xl md:text-2xl font-bold text-gray-100 flex items-center gap-3">
          <div className="p-2.5 bg-gray-800 text-emerald-400 rounded-xl">
            <FiTerminal className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          System Activity Console
        </h2>
        <div className="flex gap-2">
          {/* Quick Mock Action buttons */}
          <button
            onClick={() => {
              logActivity("DELETE", "Calendar", "Deleted Event 'Meeting'").then(fetchLogs);
            }}
          >
          </button>

          <button
            onClick={fetchLogs}
            className={`text-gray-400 hover:text-emerald-400 transition-colors p-2 rounded-lg hover:bg-gray-800 flex items-center gap-2 text-sm font-semibold`}
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Refresh Logic Tracker</span>
          </button>
        </div>
      </div>

      <p className="text-gray-400 text-sm mb-6 z-10">Monitoring global administrative actions, deletions, additions and modifications across all modules.</p>

      <div className="bg-[#0D1117] rounded-2xl p-4 md:p-6 font-mono text-xs md:text-sm shadow-inner overflow-hidden border border-gray-800 z-10 flex flex-col h-[600px] relative">
        {/* Terminal Header */}
        <div className="flex items-center gap-2 mb-4 border-b border-gray-800 pb-3 shrink-0">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <p className="text-gray-600 font-bold ml-2 text-[10px] md:text-xs">bash - admin console - 80x24</p>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar text-gray-300">
          {logs.length === 0 ? (
            <div className="text-gray-500 italic flex items-center justify-center h-full">
              ~ no logs found
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log._id}
                className="bg-gray-900 border border-gray-800 rounded-xl mb-3 overflow-hidden transition-all"
              >
                {/* Main Row */}
                <div
                  onClick={() => toggleExpand(log._id)}
                  className="cursor-pointer p-4 flex justify-between items-center hover:bg-gray-800 transition"
                >
                  <div>
                    <p className={`text-sm font-semibold ${getActionColor(log.action)}`}>
                      {log.action}
                    </p>
                    <p className="text-xs text-gray-400">
                      {log.module}
                    </p>
                  </div>

                  <span className="text-xs text-gray-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>

                {/* Expandable Section */}
                {expandedId === log._id && (
                  <div className="px-4 pb-4 border-t border-gray-800 text-sm text-gray-300 animate-fadeIn">
                    <p className="mt-3">
                      <span className="text-gray-400">User:</span>{" "}
                      {log.user?.username || "Raam Phogat"}
                    </p>

                    <p className="mt-1">
                      <span className="text-gray-400">Role:</span>{" "}
                      <span className="capitalize">{log.user?.role || "Admin"}</span>
                    </p>

                    <p className="mt-1">
                      <span className="text-gray-400">Email:</span>{" "}
                      {log.user?.email || "raam.phogat@gmail.com"}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
          {loading && (
            <div className="text-emerald-500 animate-pulse mt-4">
              <span className="mr-2">&gt;</span>fetching fresh logs...<span className="animate-ping ml-1">_</span>
            </div>
          )}
          {!loading && <div className="text-emerald-500 mt-2"><span className="mr-2 text-gray-500">&gt;</span><span className="animate-pulse">_</span></div>}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5); 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.4); 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.8); 
        }
      `}</style>
    </div>
  );
};

export default Settings;
