import React from 'react';
import { FiClock, FiLogIn, FiLogOut, FiUser } from "react-icons/fi";
import { type IUser } from '../pages/admin/AdminComponents';

interface ExpandedProps {
    user: IUser;
    isExpanded: boolean;
}

const Expanded: React.FC<ExpandedProps> = ({ user, isExpanded }) => {
    if (!isExpanded) return null;

    const formatDate = (dateString?: string) => {
        if (!dateString) return "Never";
        return new Date(dateString).toLocaleString();
    };

    return (
        <tr className="bg-gray-50/50 dark:bg-gray-800/30 animate-in fade-in slide-in-from-top-2 duration-200">
            <td colSpan={6} className="px-4 md:px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs md:text-sm p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-inner">
                    <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-lg">
                            <FiClock className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 dark:text-gray-200">Created At</p>
                            <p>{formatDate(user.createdAt)}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-lg">
                            <FiLogIn className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 dark:text-gray-200">Last Login</p>
                            <p>{formatDate(user.lastLogin)}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                        <div className="p-2 bg-orange-50 dark:bg-orange-900/20 text-orange-500 rounded-lg">
                            <FiLogOut className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 dark:text-gray-200">Last Signout</p>
                            <p>{formatDate(user.lastLogout)}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-500 rounded-lg">
                            <FiUser className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 dark:text-gray-200">Created By</p>
                            <p className="truncate max-w-[150px]" title={user.createdBy || "Admin"}>
                                {user.createdBy || "Admin"}
                            </p>
                        </div>
                    </div>
                </div>
            </td>
        </tr>
    );
};

export default Expanded;
