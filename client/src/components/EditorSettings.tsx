import React from "react";
import { useTheme } from "../context/themeContext";

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

const EditorSettings = () => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            <div className="mb-6">
                <h1 className="text-2xl font-bold dark:text-white">Settings</h1>
                <p className="text-sm text-gray-500">Manage your preferences and workspace settings.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
                <h2 className="text-lg font-bold mb-4 dark:text-white">Appearance</h2>
                <div className="space-y-4">
                    <ThemeFeatureToggle
                        label="Brutalist Mode"
                        description="High contrast, broad strokes, and raw aesthetics."
                        feature="brutalist"
                    />
                    <ThemeFeatureToggle
                        label="MacOS Style"
                        description="Clean lines, blurred backgrounds, and soft shadows."
                        feature="macos"
                    />
                    <ThemeFeatureToggle
                        label="Terminal Mode"
                        description="Monospace fonts and dark, hacker-style aesthetics."
                        feature="terminal"
                    />
                </div>
            </div>
        </div>
    );
};

export default EditorSettings;