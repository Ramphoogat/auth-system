import { useState, useEffect } from "react";
import { FiFileText } from "react-icons/fi";
import api from "../api/axios";
import { useToast } from "./ToastProvider";
import { AxiosError } from "axios";

const FormSection: React.FC = () => {
    const { showSuccess, showError } = useToast();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");
    const [description, setDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingProfile, setIsFetchingProfile] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get("/auth/profile");
                setName(res.data.user.name || res.data.user.username);
                setEmail(res.data.user.email);
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setIsFetchingProfile(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!role) {
            showError("Please select a role.");
            return;
        }
        if (!description.trim()) {
            showError("Please provide a description.");
            return;
        }

        try {
            setIsLoading(true);
            await api.post("/auth/role-requests", {
                requestedRole: role,
                description: description
            });
            showSuccess("Role request submitted successfully!");
            setDescription("");
            setRole("");
        } catch (err: unknown) {
            const error = err as AxiosError<{ message: string }>;
            const msg = error.response?.data?.message || "Failed to submit request.";
            showError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="relative z-10 text-center">

                <div className="w-14 h-14 md:w-20 md:h-20 bg-emerald-100 dark:bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-emerald-600 rotate-3 group-hover:rotate-0 transition-transform">
                    <FiFileText className="w-8 h-8 md:w-10 md:h-10" />
                </div>

                <h3 className="text-lg md:text-xl font-bold mb-6 text-gray-800 dark:text-gray-100">
                    Role Change Request
                </h3>

                <form onSubmit={handleSubmit} className="space-y-5 max-w-md mx-auto text-left">

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={isFetchingProfile ? "Loading..." : name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={isFetchingProfile ? "Loading..." : email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                        />
                    </div>

                    {/* Role Dropdown */}
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">
                            Request Role Change To
                        </label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            disabled={isLoading}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                        >
                            <option value="">Select Role</option>
                            <option value="user">User</option>
                            <option value="author">Author</option>
                            <option value="editor">Editor</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">
                            Description
                        </label>
                        <textarea
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={isLoading}
                            placeholder="Explain why you want this role change..."
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition resize-none"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading || isFetchingProfile}
                        className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Submitting..." : "Submit Request"}
                    </button>

                </form>
            </div>
        </div>
    );
};

export default FormSection;
