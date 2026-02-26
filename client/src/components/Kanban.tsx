import React, { useState, useRef, useEffect } from 'react';
import { useToast } from './ToastProvider';
import { fetchCalendarData, saveCalendarData, type CalendarPayload } from '../api/calendar';

import {
    FiPlus,
    FiMoreHorizontal,
    FiCalendar,
    FiMessageSquare,
    FiPaperclip,
    FiCheckCircle,
    FiClock,
    FiAlertCircle,
    FiX,
    FiTrash2,
    FiChevronLeft,
    FiChevronRight

} from 'react-icons/fi';
import { logActivity } from '../utils/activityLogger';

// --- Types ---

export type Priority = 'low' | 'medium' | 'high';

export interface UserInfo {
    name: string;
    email: string;
    avatar?: string;
}

export interface Task {
    id: string;
    content: string; // Task Name
    description?: string; // Task Description
    priority: Priority;
    dueDate?: string;
    comments?: number;
    attachments?: number;
    assignees?: string[]; // Initials
    tags?: string[];
    createdBy?: UserInfo;
}

export interface Column {
    id: string;
    title: string;
    taskIds: string[];
    color?: string; // e.g., 'indigo', 'amber', 'emerald', 'rose', 'cyan', 'purple', 'gray'
}

const COLUMN_COLORS = [
    { name: 'Indigo', value: 'indigo', bg: 'bg-indigo-500', headerBg: 'bg-indigo-100 dark:bg-indigo-900/40', text: 'text-indigo-800 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800' },
    { name: 'Amber', value: 'amber', bg: 'bg-amber-500', headerBg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-800 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
    { name: 'Emerald', value: 'emerald', bg: 'bg-emerald-500', headerBg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-800 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' },
    { name: 'Rose', value: 'rose', bg: 'bg-rose-500', headerBg: 'bg-rose-100 dark:bg-rose-900/40', text: 'text-rose-800 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800' },
    { name: 'Cyan', value: 'cyan', bg: 'bg-cyan-500', headerBg: 'bg-cyan-100 dark:bg-cyan-900/40', text: 'text-cyan-800 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-800' },
    { name: 'Purple', value: 'purple', bg: 'bg-purple-500', headerBg: 'bg-purple-100 dark:bg-purple-900/40', text: 'text-purple-800 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
    { name: 'Gray', value: 'gray', bg: 'bg-gray-400', headerBg: 'bg-gray-200 dark:bg-gray-800', text: 'text-gray-800 dark:text-gray-300', border: 'border-gray-300 dark:border-gray-700' },
];

export interface BoardData {
    tasks: { [key: string]: Task };
    columns: { [key: string]: Column };
    columnOrder: string[];
}

// --- Empty Initial State ---

const initialData: BoardData = {
    tasks: {},
    columns: {
        'todo': {
            id: 'todo',
            title: 'To Do',
            taskIds: [],
            color: 'indigo',
        },
        'in-progress': {
            id: 'in-progress',
            title: 'In Progress',
            taskIds: [],
            color: 'amber',
        },
        'done': {
            id: 'done',
            title: 'Done',
            taskIds: [],
            color: 'emerald',
        },
    },
    columnOrder: ['todo', 'in-progress', 'done'],
};

// --- Helper Components ---

const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
    const colors = {
        low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
        medium: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
        high: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400',
    };

    const icons = {
        low: <FiCheckCircle className="w-3 h-3 mr-1" />,
        medium: <FiClock className="w-3 h-3 mr-1" />,
        high: <FiAlertCircle className="w-3 h-3 mr-1" />
    }

    return (
        <span className={`text-xs px-2 py-1 rounded-full font-medium flex items-center w-fit ${colors[priority]}`}>
            {icons[priority]}
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
        </span>
    );
};

// --- Dropdown Menu Component ---
interface DropdownMenuProps {
    onDelete: () => void;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={(e) => {
                    e.stopPropagation(); // Prevent drag or other clicks
                    setIsOpen(!isOpen);
                }}
                className={`p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${isOpen ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300' : ''}`}
            >
                <FiMoreHorizontal size={16} />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsOpen(false);
                            onDelete();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center transition-colors"
                    >
                        <FiTrash2 className="mr-2" size={14} />
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
};


export const TaskCard: React.FC<{ task: Task; onDelete: () => void; onContextMenu: (e: React.MouseEvent) => void; readOnly?: boolean }> = ({ task, onDelete, onContextMenu, readOnly }) => {
    return (
        <div
            onContextMenu={readOnly ? undefined : onContextMenu}
            className={`
            group bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm 
            ${readOnly ? '' : 'hover:shadow-md hover:-translate-y-1 hover:border-indigo-300 dark:hover:border-indigo-600'}
            transition-all duration-200 mb-3 select-none relative
          `}
        >
            {/* Priority Line Indicator */}
            <div className={`absolute top-0 left-0 w-1 h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-l-xl
              ${task.priority === 'high' ? 'bg-rose-500' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}
          `} />

            <div className="flex justify-between items-start mb-2.5">
                <PriorityBadge priority={task.priority} />
                {!readOnly && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu onDelete={onDelete} />
                    </div>
                )}
            </div>

            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1 leading-tight">
                {task.content}
            </h4>

            {task.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                    {task.description}
                </p>
            )}

            {task.tags && task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                    {task.tags.map(tag => (
                        <span key={tag} className="text-[10px] uppercase font-bold tracking-wider text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-1.5 py-0.5 rounded">
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700/50">
                <div className="flex items-center space-x-3 text-gray-400 text-xs">
                    {task.dueDate && (
                        <div className="flex items-center hover:text-indigo-500 transition-colors">
                            <FiCalendar className="mr-1" />
                            <span>{task.dueDate}</span>
                        </div>
                    )}
                    {task.comments && task.comments > 0 ? (
                        <div className="flex items-center hover:text-indigo-500 transition-colors">
                            <FiMessageSquare className="mr-1" />
                            <span>{task.comments}</span>
                        </div>
                    ) : null}
                    {task.attachments && task.attachments > 0 ? (
                        <div className="flex items-center hover:text-indigo-500 transition-colors">
                            <FiPaperclip className="mr-1" />
                            <span>{task.attachments}</span>
                        </div>
                    ) : null}
                </div>

                <div className="flex items-center -space-x-1.5">
                    {/* Creator Avatar with Tooltip */}
                    {task.createdBy && (
                        <div className="group/avatar relative z-10">
                            {task.createdBy.avatar ? (
                                <img
                                    src={task.createdBy.avatar}
                                    alt={task.createdBy.name}
                                    className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 object-cover cursor-pointer bg-white"
                                />
                            ) : (
                                <div className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-[10px] font-bold cursor-pointer">
                                    {task.createdBy.name.charAt(0)}
                                </div>
                            )}

                            {/* Tooltip */}
                            <div className="absolute bottom-full right-0 mb-2 w-max px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/avatar:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
                                <div className="font-semibold">{task.createdBy.name}</div>
                                <div className="text-gray-300 text-[10px]">{task.createdBy.email}</div>
                            </div>
                        </div>
                    )}

                    {task.assignees && task.assignees.map((assignee, i) => (
                        <div
                            key={i}
                            className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] text-white font-bold ring-2 ring-white dark:ring-gray-800"
                            title={assignee}
                        >
                            {assignee}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Add Column Modal ---
interface AddColumnModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (title: string, color: string) => void;
}

const AddColumnModal: React.FC<AddColumnModalProps> = ({ isOpen, onClose, onAdd }) => {
    const [title, setTitle] = useState('');
    const [color, setColor] = useState('indigo');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim()) {
            onAdd(title, color);
            setTitle('');
            setColor('indigo');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add New Column</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                        <FiX size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-6">
                        <label htmlFor="columnTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Column Title
                        </label>
                        <input
                            type="text"
                            id="columnTitle"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Review, Backlog, Testing"
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            autoFocus
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Column Color
                        </label>
                        <div className="flex gap-3 flex-wrap">
                            {COLUMN_COLORS.map(c => (
                                <button
                                    key={c.value}
                                    type="button"
                                    onClick={() => setColor(c.value)}
                                    title={c.name}
                                    className={`w-8 h-8 rounded-full ${c.bg} focus:outline-none transition-transform ${color === c.value ? 'ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-gray-800 scale-110' : 'hover:scale-110'}`}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!title.trim()}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
                        >
                            Create Column
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Add Task Modal ---
interface AddTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (task: Omit<Task, 'id' | 'assignees' | 'attachments' | 'comments'>) => void;
    columnTitle?: string;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onAdd, columnTitle }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<Priority>('medium');
    const [tagInput, setTagInput] = useState('');
    const [dueDate, setDueDate] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim()) {
            const tags = tagInput.split(',').map(t => t.trim()).filter(t => t);
            onAdd({
                content: title,
                description,
                priority,
                tags,
                dueDate: dueDate || undefined
            });
            // Reset form
            setTitle('');
            setDescription('');
            setPriority('medium');
            setTagInput('');
            setDueDate('');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Add New Task to <span className="text-indigo-600 dark:text-indigo-400">{columnTitle}</span>
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                        <FiX size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar-light">
                    {/* Task Name */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Task Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="What needs to be done?"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            autoFocus
                        />
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description
                        </label>
                        <textarea
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add details about this task..."
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        {/* Priority */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Priority
                            </label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value as Priority)}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>

                        {/* Due Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Due Date
                            </label>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Tags
                        </label>
                        <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            placeholder="e.g., Frontend, Bug, V1 (comma separated)"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
                        >
                            Add Task
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Main Kanban Board ---

const Kanban: React.FC<{ readOnly?: boolean }> = ({ readOnly = false }) => {
    const { showSuccess } = useToast();
    const [data, setData] = useState<BoardData>(initialData);
    const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Calendar State
    const [calendarData, setCalendarData] = useState<CalendarPayload>({ events: [], ranges: [] });

    useEffect(() => {
        fetchCalendarData().then(res => setCalendarData(res)).catch(console.error);
    }, []);

    // Context Menu State
    const [contextMenu, setContextMenu] = useState<{
        x: number;
        y: number;
        taskId: string;
        taskContent: string;
        sourceColumnId: string;
    } | null>(null);

    useEffect(() => {
        const handleClick = () => setContextMenu(null);
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    // Task Modal State
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [activeColumnId, setActiveColumnId] = useState<string | null>(null);

    const handleContextMenu = (e: React.MouseEvent, taskId: string, taskContent: string, columnId: string) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({
            x: e.pageX,
            y: e.pageY,
            taskId,
            taskContent,
            sourceColumnId: columnId
        });
    };

    const handleMoveTask = (targetColumnId: string) => {
        if (!contextMenu) return;
        const { taskId, sourceColumnId } = contextMenu;

        if (sourceColumnId === targetColumnId) {
            setContextMenu(null);
            return;
        }

        const sourceColumn = data.columns[sourceColumnId];
        const targetColumn = data.columns[targetColumnId];

        const newSourceTaskIds = sourceColumn.taskIds.filter(id => id !== taskId);
        const newTargetTaskIds = [...targetColumn.taskIds, taskId]; // Append to end

        const newSourceColumn = { ...sourceColumn, taskIds: newSourceTaskIds };
        const newTargetColumn = { ...targetColumn, taskIds: newTargetTaskIds };

        setData(prev => ({
            ...prev,
            columns: {
                ...prev.columns,
                [newSourceColumn.id]: newSourceColumn,
                [newTargetColumn.id]: newTargetColumn
            }
        }));
        setContextMenu(null);
        logActivity("UPDATE", "Kanban", `Moved task to ${targetColumn.title}`);
    };

    const handleAddColumn = (title: string, color: string) => {
        const newColumnId = `column-${Date.now()}`;
        const newColumn: Column = {
            id: newColumnId,
            title: title,
            taskIds: [],
            color: color,
        };

        setData(prev => ({
            ...prev,
            columns: {
                ...prev.columns,
                [newColumnId]: newColumn,
            },
            columnOrder: [...prev.columnOrder, newColumnId],
        }));
        setIsColumnModalOpen(false);
        showSuccess(`Column "${title}" added`);
        logActivity("CREATE", "Kanban", `Created column: ${title}`);
    };

    const openAddTaskModal = (columnId: string) => {
        setActiveColumnId(columnId);
        setIsTaskModalOpen(true);
    };

    const handleAddTask = async (taskData: Omit<Task, 'id' | 'assignees' | 'attachments' | 'comments'>) => {
        if (!activeColumnId) return;

        const newTaskId = `task-${Date.now()}`;
        const newTask: Task = {
            id: newTaskId,
            ...taskData,
            comments: 0,
            attachments: 0,
            assignees: [],
        };

        const column = data.columns[activeColumnId];
        const newTaskIds = [...column.taskIds, newTaskId];

        const newColumn = {
            ...column,
            taskIds: newTaskIds,
        };

        setData(prev => ({
            ...prev,
            tasks: {
                ...prev.tasks,
                [newTaskId]: newTask
            },
            columns: {
                ...prev.columns,
                [newColumn.id]: newColumn
            }
        }));

        setIsTaskModalOpen(false);
        setActiveColumnId(null);
        showSuccess(`Task "${taskData.content}" added`);
        logActivity("CREATE", "Kanban", `Created task: ${taskData.content}`);

        // Add to Calendar
        const newEventDate = taskData.dueDate ? new Date(taskData.dueDate) : new Date();
        const newEvent = {
            id: newTaskId,
            start: newEventDate,
            end: newEventDate,
            title: taskData.content,
            color: 'default' as const,
            description: taskData.description,
            tags: taskData.tags,
            createdAt: new Date(),
        };

        const newCalendarPayload = {
            ...calendarData,
            events: [...calendarData.events, newEvent]
        };
        setCalendarData(newCalendarPayload);
        try {
            await saveCalendarData(newCalendarPayload);
        } catch (err) {
            console.error('Failed to save task to calendar:', err);
        }
    };

    const handleDeleteTask = async (columnId: string, taskId: string) => {
        const taskName = data.tasks[taskId]?.content || 'Task';
        const column = data.columns[columnId];
        const newTaskIds = column.taskIds.filter(id => id !== taskId);

        const newColumn = {
            ...column,
            taskIds: newTaskIds
        };

        const newTasks = { ...data.tasks };
        delete newTasks[taskId];

        setData(prev => ({
            ...prev,
            tasks: newTasks,
            columns: {
                ...prev.columns,
                [newColumn.id]: newColumn
            }
        }));
        showSuccess(`Task "${taskName}" deleted`);
        logActivity("DELETE", "Kanban", `Deleted task: ${taskName}`);

        // Delete from Calendar
        const newCalendarPayload = {
            ...calendarData,
            events: calendarData.events.filter(e => e.id !== taskId)
        };
        setCalendarData(newCalendarPayload);
        try {
            await saveCalendarData(newCalendarPayload);
        } catch (err) {
            console.error('Failed to delete task from calendar:', err);
        }
    };

    const handleDeleteColumn = async (columnId: string) => {
        const column = data.columns[columnId];
        const columnName = column.title;
        const taskIdsToRemove = column.taskIds;

        const newColumnOrder = data.columnOrder.filter(id => id !== columnId);
        const newColumns = { ...data.columns };
        delete newColumns[columnId];

        const newTasks = { ...data.tasks };
        taskIdsToRemove.forEach(taskId => {
            delete newTasks[taskId];
        });

        setData(prev => ({
            ...prev,
            tasks: newTasks,
            columns: newColumns,
            columnOrder: newColumnOrder
        }));
        showSuccess(`Column "${columnName}" deleted`);
        logActivity("DELETE", "Kanban", `Deleted column: ${columnName}`);

        // Delete from Calendar
        const newCalendarPayload = {
            ...calendarData,
            events: calendarData.events.filter(e => !taskIdsToRemove.includes(e.id))
        };
        setCalendarData(newCalendarPayload);
        try {
            await saveCalendarData(newCalendarPayload);
        } catch (err) {
            console.error('Failed to delete column tasks from calendar:', err);
        }
    };

    return (
        <div className="h-full w-full flex flex-col overflow-hidden bg-gray-50/50 dark:bg-gray-900/50 p-6 md:p-8 relative">
            {/* Context Menu Overlay */}
            {contextMenu && (
                <div
                    className="fixed z-[100] w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="bg-gray-50 dark:bg-gray-700/50 px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Move to</span>
                        <div className="text-xs text-gray-900 dark:text-gray-200 font-medium truncate mt-0.5">"{contextMenu.taskContent}"</div>
                    </div>
                    <div className="py-1">
                        {data.columnOrder.map(colId => {
                            if (colId === contextMenu.sourceColumnId) return null;
                            const col = data.columns[colId];
                            const colorObj = COLUMN_COLORS.find(c => c.value === (col.color || 'gray')) || COLUMN_COLORS[6];

                            return (
                                <button
                                    key={colId}
                                    onClick={() => handleMoveTask(colId)}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center"
                                >
                                    <span className={`w-2 h-2 rounded-full mr-2 ${colorObj.bg}`}></span>
                                    {col.title}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            <AddColumnModal
                isOpen={isColumnModalOpen}
                onClose={() => setIsColumnModalOpen(false)}
                onAdd={handleAddColumn}
            />

            <AddTaskModal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                onAdd={handleAddTask}
                columnTitle={activeColumnId ? data.columns[activeColumnId]?.title : ''}
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <div className="w-full md:w-auto text-center md:text-left">
                    <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                        Project Kanban
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm mt-1">Manage tasks and track progress. Right-click cards to move them.</p>
                </div>
                {!readOnly && (
                    <div className="flex w-full md:w-auto space-x-3 justify-center md:justify-end">
                        <button
                            onClick={() => setIsColumnModalOpen(true)}
                            className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-lg shadow-indigo-500/30 transition-all active:scale-95 font-medium text-sm w-full md:w-auto justify-center"
                        >
                            <FiPlus className="mr-2" /> Add Column
                        </button>
                    </div>
                )}
            </div>

            {/* Board Area */}
            <div className="flex-1 relative group/board">
                {/* Left Button - Full Height Transparent Area */}
                <button
                    onClick={() => scroll('left')}
                    className="absolute -left-6 md:-left-8 top-30 h-100 w-6 md:w-8 z-30 group/left hover:bg-indigo-500/5 dark:hover:bg-indigo-400/5 transition-all duration-300 flex items-center justify-center opacity-50 hover:opacity-100"
                    aria-label="Scroll Left"
                >
                    {/* Visible Button */}
                    <div className="bg-transparent h-full dark:bg-transparent text-gray-600 rounded-r-xl dark:text-gray-300 group-hover/left:bg-white dark:group-hover/left:bg-gray-700 group-hover/left:scale-110 group-hover/left:text-indigo-600 dark:group-hover/left:text-indigo-400 transition-all">
                        <FiChevronLeft className="w-14 h-14 md:w-7 md:h-100" />
                    </div>
                </button>

                {/* Right Button - Full Height Transparent Area */}
                <button
                    onClick={() => scroll('right')}
                    className="absolute -right-6 md:-right-8 top-30 h-100 w-6 md:w-8 z-30 group/right hover:bg-indigo-500/5 dark:hover:bg-indigo-400/5 transition-all duration-300 flex items-center justify-center opacity-50 hover:opacity-100 text-gray-500"
                    aria-label="Scroll Right"
                >
                    {/* Visible Button */}
                    <div className="bg-transparent h-full dark:bg-transparent text-gray-600 rounded-l-xl dark:text-gray-300 group-hover/right:bg-white dark:group-hover/right:bg-gray-700 group-hover/right:scale-110 group-hover/right:text-indigo-600 dark:group-hover/right:text-indigo-400 transition-all">
                        <FiChevronRight className="w-14 h-14 md:w-7 md:h-100" />
                    </div>
                </button>

                <div
                    ref={scrollContainerRef}
                    className="h-full overflow-x-auto pb-3 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                    <div className="flex h-full space-x-6 min-w-max px-1">
                        {data.columnOrder.map((columnId) => {
                            const column = data.columns[columnId];
                            const tasks = column.taskIds.map((taskId) => data.tasks[taskId]);

                            return (
                                <div key={column.id} className="w-80 flex-shrink-0 flex flex-col h-full rounded-2xl bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                                    {/* Column Header */}
                                    {(() => {
                                        const colorObj = COLUMN_COLORS.find(c => c.value === (column.color || 'gray')) || COLUMN_COLORS[6];
                                        return (
                                            <div className={`p-4 flex items-center justify-between sticky top-0 z-10 rounded-t-2xl border-b ${colorObj.headerBg} ${colorObj.border} mb-3 backdrop-blur-sm`}>
                                                <div className="flex items-center space-x-2 w-full">
                                                    <h3 className={`font-bold text-sm truncate ${colorObj.text}`}>{column.title}</h3>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold bg-white/60 dark:bg-black/20 ${colorObj.text}`}>
                                                        {tasks.length}
                                                    </span>
                                                </div>
                                                {!readOnly && (
                                                    <div className="relative pl-2">
                                                        <DropdownMenu onDelete={() => handleDeleteColumn(column.id)} />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}

                                    {/* Task List */}
                                    <div className="flex-1 overflow-y-auto px-3 pb-3 custom-scrollbar-light">
                                        <div className="min-h-[100px]">
                                            {tasks.map((task) => (
                                                <TaskCard
                                                    key={task.id}
                                                    task={task}
                                                    onDelete={() => handleDeleteTask(column.id, task.id)}
                                                    onContextMenu={(e) => handleContextMenu(e, task.id, task.content, column.id)}
                                                    readOnly={readOnly}
                                                />
                                            ))}
                                            {tasks.length === 0 && (
                                                <div className="h-24 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                                                    <span className="text-xs">No tasks yet</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Footer - Add Task button */}
                                    {!readOnly && (
                                        <div className="p-3 mt-auto">
                                            <button
                                                onClick={() => openAddTaskModal(column.id)}
                                                className="w-full py-2 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm font-medium border border-transparent hover:border-gray-300 dark:hover:border-gray-600 border-dashed"
                                            >
                                                <FiPlus className="mr-1.5" /> Add card
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Kanban;
