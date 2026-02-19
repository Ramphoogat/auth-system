import React, { useState, useEffect } from 'react';
import { FiGithub, FiLinkedin } from 'react-icons/fi';
import Loader from './Loader';

interface TeamMember {
    id: string;
    name: string;
    role: string;
    imageUrl: string;
    githubUrl?: string;
    linkedinUrl?: string;
}

const OurTeams: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [members, setMembers] = useState<TeamMember[]>([]);

    useEffect(() => {
        // Simulating data fetching
        const timer = setTimeout(() => {
            // Placeholder empty as requested
            setMembers([
                // Example structure if needed, but keeping empty for now or maybe one mock
                // {
                //     id: '1',
                //     name: 'John Doe',
                //     role: 'Frontend Developer',
                //     imageUrl: 'https://ui-avatars.com/api/?name=John+Doe',
                //     githubUrl: '#',
                //     linkedinUrl: '#'
                // }
            ]);
            setLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <Loader text="Loading Team Members..." />
            </div>
        );
    }

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Our Team</h2>

            {members.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <FiUsers className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">No team members found.</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Check back later for updates.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {members.map((member) => (
                        <div key={member.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col items-center hover:shadow-md transition-shadow duration-300">
                            <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-4 border-gray-50 dark:border-gray-700">
                                <img
                                    src={member.imageUrl}
                                    alt={member.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{member.name}</h3>
                            <p className="text-emerald-500 text-sm font-medium mb-4">{member.role}</p>

                            <div className="flex space-x-3 mt-auto">
                                {member.githubUrl && (
                                    <a
                                        href={member.githubUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                    >
                                        <FiGithub className="w-5 h-5" />
                                    </a>
                                )}
                                {member.linkedinUrl && (
                                    <a
                                        href={member.linkedinUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                                    >
                                        <FiLinkedin className="w-5 h-5" />
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Start of Selection
import { FiUsers } from 'react-icons/fi';
// End of Selection

export default OurTeams;
