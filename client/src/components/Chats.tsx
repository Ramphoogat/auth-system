import React from 'react';

const Chats: React.FC = () => {
    return (
        <div className="w-full h-full bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden animate-in fade-in duration-500 p-6 flex flex-col">
            <h2 className="text-xl font-bold dark:text-white mb-4">Chats</h2>
            <div className="flex-1 flex items-center justify-center p-12 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50/50 dark:bg-gray-800/50">
                <p>Chat interface will be implemented here.</p>
            </div>
        </div>
    );
};

export default Chats;
