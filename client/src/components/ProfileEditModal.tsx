
import React, { useState, useEffect } from "react";
import { FiX, FiUser, FiMail, FiLock, FiSave, FiAlertCircle } from "react-icons/fi";
import api from "../api/axios";
import { useToast } from "../components/ToastProvider";
import { logActivity } from "../utils/activityLogger";

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    name: string;
    username: string;
    email: string;
  };
  onUpdate: () => void;
}

interface UpdateProfilePayload {
  name: string;
  username: string;
  email: string;
  currentPassword?: string;
  newPassword?: string;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdate,
}) => {
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    currentPassword: "",
    newPassword: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && currentUser) {
      setFormData({
        name: currentUser.name || "",
        username: currentUser.username || "",
        email: currentUser.email || "",
        currentPassword: "",
        newPassword: "",
      });
    }
  }, [isOpen, currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: UpdateProfilePayload = {
        name: formData.name,
        username: formData.username,
        email: formData.email,
      };

      if (formData.newPassword) {
        if (!formData.currentPassword) {
          showError("Current password is required to set a new password.");
          setLoading(false);
          return;
        }
        payload.currentPassword = formData.currentPassword;
        payload.newPassword = formData.newPassword;
      }

      const res = await api.put("/auth/profile", payload);

      showSuccess(res.data.message);
      logActivity("UPDATE", "Profile", "Updated profile details");
      onUpdate(); // Refresh parent data
      onClose();
    } catch (err: unknown) {
      const errorStr = err as { response?: { data?: { message?: string } } };
      const msg = errorStr.response?.data?.message || "Failed to update profile";
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 pointer-events-none" />

        {/* Header */}
        <div className="relative px-6 md:px-8 pt-6 md:pt-8 pb-4 flex justify-between items-start">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Edit Profile</h2>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">Update your personal details</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-400 hover:text-red-500"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 md:px-8 pb-8 pt-2 space-y-4 md:space-y-5">
          {/* Name & Username Group */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Name</label>
              <div className="relative group">
                <FiUser className="absolute left-3 top-3 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 md:py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium text-gray-700 dark:text-gray-200"
                  placeholder="Your Name"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Username</label>
              <div className="relative group">
                <div className="absolute left-3 top-3 text-gray-400 group-focus-within:text-emerald-500 transition-colors">@</div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-8 pr-4 py-2 md:py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium text-gray-700 dark:text-gray-200"
                  placeholder="username"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
            <div className="relative group">
              <FiMail className="absolute left-3 top-3 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium text-gray-700 dark:text-gray-200"
                placeholder="name@example.com"
              />
            </div>
            {(formData.email !== currentUser.email) && (
              <p className="text-[10px] text-amber-600 flex items-center mt-1 ml-1 font-medium">
                <FiAlertCircle className="mr-1" /> Changing email will require re-verification.
              </p>
            )}
          </div>

          <div className="border-t border-gray-100 dark:border-gray-700 my-4" />

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">New Password (Optional)</label>
              <div className="relative group">
                <FiLock className="absolute left-3 top-3 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium text-gray-700 dark:text-gray-200"
                  placeholder="Leave blank to keep current"
                />
              </div>
            </div>

            {formData.newPassword && (
              <div className="space-y-1 animate-in slide-in-from-top-2 duration-200">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Current Password (Required)</label>
                <div className="relative group">
                  <FiLock className="absolute left-3 top-3 text-red-400 group-focus-within:text-red-500 transition-colors" />
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-red-50/30 dark:bg-red-500/10 border border-red-100 dark:border-red-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-sm font-medium text-gray-700 dark:text-gray-200 placeholder-red-300 dark:placeholder-red-500/40"
                    placeholder="Confirm current password"
                    required
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <FiSave className="w-5 h-5" />
                <span>Update Profile</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditModal;
