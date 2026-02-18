import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiUser, FiClock } from 'react-icons/fi';
import api from '../api/axios';
import { useToast } from './ToastProvider';

interface IRequest {
    _id: string; // Changed from id to _id to match MongoDB
    userId: {
        _id: string;
        name: string;
        username: string;
        email: string;
        avatar?: string;
    };
    currentRole: string;
    requestedRole: string;
    status: 'pending' | 'approved' | 'rejected';
    description: string; // Changed from reason to description
    createdAt: string; // Changed from requestDate to createdAt
}

const Requests: React.FC = () => {
    const [requests, setRequests] = useState<IRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { showSuccess, showError } = useToast();

    const fetchRequests = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/auth/role-requests'); // Assuming this endpoint exists
            setRequests(response.data.requests || []);
        } catch (error) {
            console.error("Failed to fetch requests", error);
            // Fallback to empty list or show error, but don't crash
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleApprove = async (id: string, userId: string, requestedRole: string) => {
        try {
            await api.put(`/auth/role-requests/${id}/approve`, { userId, role: requestedRole });
            setRequests(prev => prev.map(req => req._id === id ? { ...req, status: 'approved' } : req));
            showSuccess("Request approved successfully");
        } catch (error) {
            console.error("Failed to approve request", error);
            showError("Failed to approve request");
        }
    };

    const handleReject = async (id: string) => {
        try {
            await api.put(`/auth/role-requests/${id}/reject`);
            setRequests(prev => prev.map(req => req._id === id ? { ...req, status: 'rejected' } : req));
            showSuccess("Request rejected");
        } catch (error) {
            console.error("Failed to reject request", error);
            showError("Failed to reject request");
        }
    };

    if (isLoading) {
        return (
            <div className="w-full mt-8 p-8 flex justify-center items-center bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="w-full bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden animate-in fade-in duration-500">

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-200 dark:bg-gray-900 text-gray-500 uppercase text-xs font-bold">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Current Role</th>
                            <th className="px-6 py-4">Requested</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {requests.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                    No requests found.
                                </td>
                            </tr>
                        ) : (
                            requests.map((req) => (
                                <tr key={req._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 overflow-hidden">
                                                {req.userId?.avatar ? (
                                                    <img src={req.userId.avatar} alt={req.userId.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <FiUser />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-800 dark:text-gray-200">{req.userId?.name || 'Unknown'}</div>
                                                <div className="text-xs text-gray-500">{req.userId?.email || ''}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-md bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 capitalize`}>
                                            {req.currentRole}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-md bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300 capitalize`}>
                                                {req.requestedRole}
                                            </span>
                                            <div className="text-[10px] text-gray-400 mt-1 max-w-[150px] truncate" title={req.description}>
                                                "{req.description}"
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 text-sm text-gray-500">
                                            <FiClock size={12} />
                                            {new Date(req.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full capitalize
                                            ${req.status === 'approved' ? 'bg-emerald-100 text-emerald-600' :
                                                req.status === 'rejected' ? 'bg-red-100 text-red-600' :
                                                    'bg-amber-100 text-amber-600'}`}>
                                            {req.status === 'approved' && <FiCheck size={12} />}
                                            {req.status === 'rejected' && <FiX size={12} />}
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {req.status === 'pending' && (
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleApprove(req._id, req.userId._id, req.requestedRole)}
                                                    className="p-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
                                                    title="Approve"
                                                >
                                                    <FiCheck size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleReject(req._id)}
                                                    className="p-2 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                                                    title="Reject"
                                                >
                                                    <FiX size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Requests;
