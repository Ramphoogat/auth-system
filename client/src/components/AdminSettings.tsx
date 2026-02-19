import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { FiCpu, FiShield, FiLock, FiCheckCircle } from "react-icons/fi";
import { useToast } from "./ToastProvider";
import { useTheme } from "../context/themeContext";

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

export default Settings;
