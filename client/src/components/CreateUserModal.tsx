import React, { useState } from "react";
import { FiX, FiUser, FiMail, FiLock, FiPlus, FiShield } from "react-icons/fi";
import api from "../api/axios";
import { useToast } from "../components/ToastProvider";

interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUserCreated: () => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({
    isOpen,
    onClose,
    onUserCreated,
}) => {
    const { showSuccess, showError } = useToast();
    const [formData, setFormData] = useState({
        unique_id: "",
        name: "",
        username: "",
        email: "",
        password: "",
        role: "user",
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Use the admin endpoint to create user with role
            await api.post("/auth/admin/users", formData);

            showSuccess("User created successfully!");
            setFormData({
                unique_id: "",
                name: "",
                username: "",
                email: "",
                password: "",
                role: "user",
            });
            onUserCreated();
            onClose();
        } catch (err: unknown) {
            const errorStr = err as { response?: { data?: { message?: string } } };
            const msg = errorStr.response?.data?.message || "Failed to create user";
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
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 pointer-events-none" />

                {/* Header */}
                <div className="relative px-6 md:px-8 pt-6 md:pt-8 pb-4 flex justify-between items-start">
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Create New User</h2>
                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">Add a new user to the system.</p>
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
                            <label htmlFor="name" className="text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Name</label>
                            <div className="relative group">
                                <FiUser className="absolute left-3 top-3 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                                <input
                                    id="name"
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 md:py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium text-gray-700 dark:text-gray-200"
                                    placeholder="Full Name"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="username" className="text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Username</label>
                            <div className="relative group">
                                <div className="absolute left-3 top-3 text-gray-400 group-focus-within:text-emerald-500 transition-colors">@</div>
                                <input
                                    id="username"
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full pl-8 pr-4 py-2 md:py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium text-gray-700 dark:text-gray-200"
                                    placeholder="username"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="role" className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Role</label>
                        <div className="relative group">
                            <FiShield className="absolute left-3 top-3 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium text-gray-700 dark:text-gray-200 appearance-none cursor-pointer"
                            >
                                <option value="user">User</option>
                                <option value="author">Author</option>
                                <option value="editor">Editor</option>
                                <option value="admin">Admin</option>
                            </select>
                            <div className="absolute right-3 top-3 pointer-events-none text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="email" className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
                        <div className="relative group">
                            <FiMail className="absolute left-3 top-3 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium text-gray-700 dark:text-gray-200"
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="password" className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Password</label>
                        <div className="relative group">
                            <FiLock className="absolute left-3 top-3 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium text-gray-700 dark:text-gray-200"
                                placeholder="Create password"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-red-500/40 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <FiPlus className="w-5 h-5" />
                                <span>Create User</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateUserModal;
