import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FiX, FiDatabase, FiUpload, FiRefreshCw } from "react-icons/fi";
import { AxiosError } from "axios";
import api from "../api/axios";
import { useToast } from "./ToastProvider";

// Basic Modal if not existing, but let me check if there is a Modal component.
// checking previous file lists... I saw `ProfileEditModal` and `CreateUserModal`.
// They likely use a common pattern or library.
// I'll implement a self-contained modal structure just to be safe, echoing the style of `ProfileEditModal`.

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncComplete?: () => void;
}

const GoogleSheetsModal = ({
  isOpen,
  onClose,
  onSyncComplete,
}: GoogleSheetsModalProps) => {
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const [sheetId, setSheetId] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      setStatusLoading(true);
      const res = await api.get("/sheets/status"); // Assuming new route base is /api/sheets
      setIsConnected(res.data.connected);
      if (res.data.sheetId) setSheetId(res.data.sheetId);
      setLastSync(res.data.lastSync);
    } catch (err: unknown) {
      const error = err as AxiosError;
      console.error("Failed to fetch sheet status", error);
      if (error.response && error.response.status === 401) {
        showError("Session expired. Please login again.");
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setStatusLoading(false);
    }
  }, [navigate, showError]);

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [fetchStatus, isOpen]);

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      await api.post("/sheets/connect", { sheetId });
      showSuccess("Connected to Google Sheet successfully");
      setIsConnected(true);
      fetchStatus();
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      const msg =
        error.response?.data?.message ||
        "Failed to connect. Check permissions.";
      showError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePush = async () => {
    if (
      !window.confirm("This will overwrite the Google Sheet content. Continue?")
    )
      return;
    try {
      setIsLoading(true);
      const res = await api.post("/sheets/sync/push");
      showSuccess(res.data.message);
      fetchStatus();
      if (onSyncComplete) onSyncComplete();
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string; details?: unknown }>;
      console.error("Sync Push Error:", error.response?.data || error); // Log server details
      showError(error.response?.data?.message || "Sync failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
            <FiDatabase className="text-green-600" /> Google Sheets Sync
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Section */}
          <div
            className={`p-4 rounded-xl border ${isConnected ? "bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800" : "bg-gray-50 border-gray-200 dark:bg-gray-700/30 dark:border-gray-600"}`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-gray-400"}`}
              ></div>
              <span className="font-semibold text-sm dark:text-gray-200">
                {statusLoading
                  ? "Checking..."
                  : isConnected
                    ? "Connected"
                    : "Not Connected"}
              </span>
            </div>
            {lastSync && (
              <p className="text-xs text-gray-500 mt-2 ml-6">
                Last Sync: {new Date(lastSync).toLocaleString()}
              </p>
            )}
          </div>

          {/* Connection Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">
              Google Sheet ID or URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={sheetId}
                onChange={(e) => setSheetId(e.target.value)}
                placeholder="1BxiMVs0XRA5nFMdKbBdB_724..."
                className="flex-1 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
              />
              <button
                onClick={handleConnect}
                disabled={isLoading || !sheetId}
                className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold text-xs hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {isLoading ? <FiRefreshCw className="animate-spin" /> : "Save"}
              </button>
            </div>
            <p className="text-[10px] text-gray-400">
              Ensure the service account email has "Editor" access to this
              sheet.
            </p>
          </div>

          {/* Actions */}
          {isConnected && (
            <div className="grid gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={handlePush}
                disabled={isLoading}
                className="flex items-center justify-center p-4 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-all gap-2"
              >
                <FiUpload className="text-xl" />
                <span className="text-xs font-bold">Export Users</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleSheetsModal;
