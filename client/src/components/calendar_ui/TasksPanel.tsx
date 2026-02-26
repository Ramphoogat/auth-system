import { cn } from '../../lib/utils';
import { format, startOfDay } from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import { useCalendar, type CalendarEvent } from './calendar-context';
import { useToast } from '../ToastProvider';
import { RANGE_COLORS, getRangeStyle } from './calendar-utils';
import { logActivity } from '../../utils/activityLogger';
// ─── Helpers ──────────────────────────────────────────────────────────────────

const colorDotClass: Record<string, string> = {
    default: 'bg-primary',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    pink: 'bg-pink-500',
    purple: 'bg-purple-500',
};

import { FiList, FiMaximize2, FiRotateCcw, FiTrash2, FiEdit3, FiCalendar, FiTarget } from 'react-icons/fi';
export const TasksPanelTrigger = () => {
    const { isTasksPanelOpen, setIsTasksPanelOpen, setIsEventModalOpen } = useCalendar();
    return (
        <button
            onClick={() => {
                const nextState = !isTasksPanelOpen;
                setIsTasksPanelOpen(nextState);
                if (nextState) setIsEventModalOpen(false);
            }}
            className={cn(
                "group relative flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-300",
                "bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border-gray-200 dark:border-gray-700",
                "hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10",
                isTasksPanelOpen ? "border-blue-500 ring-2 ring-blue-500/20 shadow-lg shadow-blue-500/10 text-blue-600 dark:text-blue-400" : "text-blue-600 dark:text-blue-400"
            )}
        >
            <FiList className={cn("w-4 h-4 transition-transform group-hover:scale-110", isTasksPanelOpen && "text-blue-500")} />
            <span className="font-bold text-sm">Tasks</span>
            {isTasksPanelOpen && (
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
            )}
        </button>
    );
};

// ─── RangeCard ────────────────────────────────────────────────────────────────

type RangeCardProps = {
    range: {
        createdAt?: Date; start: Date; end: Date; description?: string; colorIndex?: number
    };
    idx: number;
    style: ReturnType<typeof getRangeStyle>;
    days: number;
    displayName: string;
    description?: string;
    onDelete: () => void;
    onRename: (label: string) => void;
    onUpdateDescription: (description: string) => void;
    onUpdateColor: (colorIndex: number) => void;
};

const RangeCard = ({ range, idx, style, days, displayName, description = '', onDelete, onRename, onUpdateDescription, onUpdateColor }: RangeCardProps) => {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(displayName);
    const inputRef = useRef<HTMLInputElement>(null);

    // Description editing state
    const [editingDesc, setEditingDesc] = useState(false);
    const [descDraft, setDescDraft] = useState(description);
    const descRef = useRef<HTMLTextAreaElement>(null);

    const startEdit = () => {
        setDraft(displayName);
        setEditing(true);
        setTimeout(() => inputRef.current?.select(), 0);
    };

    const commit = () => {
        const trimmed = draft.trim();
        onRename(trimmed || displayName);
        setEditing(false);
    };

    const cancel = () => {
        setDraft(displayName);
        setEditing(false);
    };

    const startDescEdit = () => {
        setDescDraft(description);
        setEditingDesc(true);
        setTimeout(() => descRef.current?.focus(), 0);
    };

    const commitDesc = () => {
        onUpdateDescription(descDraft.trim());
        setEditingDesc(false);
    };

    const cancelDesc = () => {
        setDescDraft(description);
        setEditingDesc(false);
    };

    // Use current color for border
    const currentColor = RANGE_COLORS[(range.colorIndex ?? idx) % RANGE_COLORS.length];

    return (
        <div
            className="group relative flex items-start gap-3 p-3 rounded-xl border bg-card hover:bg-muted/40 transition-colors"
            style={{ borderColor: `hsla(${currentColor.h}, ${currentColor.s}%, ${currentColor.l}%, 0.3)` }}
        >
            <div className="shrink-0 size-3 rounded-full mt-1" style={{ backgroundColor: style.capBg }} />

            <div className="flex-1 min-w-0">
                {editing ? (
                    <input
                        ref={inputRef}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onBlur={commit}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') { e.preventDefault(); commit(); }
                            if (e.key === 'Escape') { e.preventDefault(); cancel(); }
                        }}
                        autoFocus
                        className="w-full text-xs font-bold bg-transparent border-b-2 outline-none pb-0.5 mb-0.5"
                        style={{ color: style.label, borderColor: style.capBg }}
                        placeholder="Range name…"
                        maxLength={48}
                    />
                ) : (
                    <button
                        type="button"
                        onClick={startEdit}
                        title="Click to rename"
                        className="flex items-center gap-1 group/name max-w-full"
                    >
                        <span className="text-xs font-bold truncate hover:underline underline-offset-2" style={{ color: style.label }}>
                            {displayName}
                        </span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="size-2.5 shrink-0 opacity-0 group-hover/name:opacity-70 transition-opacity"
                            viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                            style={{ color: style.label }}
                        >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                    </button>
                )}

                <div className="flex flex-wrap gap-1 mt-2 mb-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {RANGE_COLORS.map((c, i) => {
                        const isSelected = range.colorIndex !== undefined ? range.colorIndex === i : (idx % RANGE_COLORS.length) === i;
                        return (
                            <button
                                key={i}
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onUpdateColor(i); }}
                                className={cn(
                                    "size-3.5 rounded-full border border-black/10 dark:border-white/10 hover:scale-125 transition-transform cursor-pointer relative flex items-center justify-center",
                                    isSelected && "ring-2 ring-offset-1 ring-primary dark:ring-offset-gray-900"
                                )}
                                style={{ backgroundColor: `hsl(${c.h}, ${c.s}%, ${c.l}%)` }}
                                title={`Set color ${i + 1}`}
                            >
                                {isSelected && (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="size-2 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Description */}
                {editingDesc ? (
                    <textarea
                        ref={descRef}
                        value={descDraft}
                        onChange={(e) => setDescDraft(e.target.value)}
                        onBlur={commitDesc}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitDesc(); }
                            if (e.key === 'Escape') { e.preventDefault(); cancelDesc(); }
                        }}
                        rows={2}
                        className="w-full mt-1.5 px-2 py-1.5 text-xs bg-muted/50 dark:bg-gray-700/50 border border-border rounded-lg outline-none focus:ring-1 focus:ring-primary/30 resize-none text-gray-700 dark:text-gray-200 placeholder-muted-foreground/50"
                        placeholder="Add a description for this range..."
                        autoFocus
                    />
                ) : description ? (
                    <button
                        type="button"
                        onClick={startDescEdit}
                        className="w-full text-left mt-1 text-[11px] text-muted-foreground/80 line-clamp-2 hover:text-foreground transition-colors cursor-pointer"
                        title="Click to edit description"
                    >
                        {description}
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={startDescEdit}
                        className="w-full text-left mt-1 text-[11px] text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity hover:text-muted-foreground/70 cursor-pointer"
                    >
                        + Add description...
                    </button>
                )}

                <div className="mt-3 pt-2.5 pb-0.5 border-t border-border/50">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums truncate">
                        {format(range.start, 'MMM d')} → {format(range.end, 'MMM d')}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                        {days} {days === 1 ? 'day' : 'days'}
                        {range.start.getFullYear() !== range.end.getFullYear() && (
                            <span className="ml-1">across {range.end.getFullYear() - range.start.getFullYear() + 1} years</span>
                        )}
                    </p>
                    {range.createdAt && !isNaN(new Date(range.createdAt).getTime()) && (
                        <p className="text-[10px] text-muted-foreground/50 mt-0.5 flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="size-2.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                            </svg>
                            Created {format(new Date(range.createdAt), 'MMM d, hh:mm a')}
                        </p>
                    )}
                </div>
            </div>

            <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 flex items-center self-center">
                <button
                    type="button"
                    onClick={onDelete}
                    title="Delete range"
                    className="size-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all border border-transparent hover:border-red-200 dark:hover:border-red-800"
                >
                    <FiTrash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

// ─── TasksPanel ───────────────────────────────────────────────────────────────

export const TasksPanel = () => {
    const {
        isTasksPanelOpen, setIsTasksPanelOpen,
        events, deleteEvent, undoDelete,
        ranges, deleteRange, undoDeleteRange, renameRange, updateRangeDescription, updateRangeColor,
        setIsEventModalOpen, setSelectedDateForEvent, setSelectedEventForEdit,
    } = useCalendar();
    const { showError } = useToast();
    const [activeTab, setActiveTab] = useState<'events' | 'ranges'>('events');

    const localTasks = events.filter((e) => e.type === 'task' || !e.type);

    return (
        <>
            {isTasksPanelOpen && (
                <div
                    className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm transition-opacity duration-300"
                    onClick={() => setIsTasksPanelOpen(false)}
                />
            )}

            <div className={cn(
                'fixed top-0 right-0 bottom-0 z-[95] w-full max-w-sm flex flex-col bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-l border-gray-200 dark:border-gray-800 shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]',
                isTasksPanelOpen ? 'translate-x-0' : 'translate-x-full'
            )}>
                {/* Header */}
                <div className="px-6 pt-8 pb-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">Workspace</h2>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                {localTasks.length + ranges.length} Active Items
                            </p>
                        </div>
                        <button
                            onClick={() => setIsTasksPanelOpen(false)}
                            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all"
                        >
                            <FiMaximize2 className="w-5 h-5 rotate-45" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex p-1 bg-gray-100/80 dark:bg-gray-800/80 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                        <button
                            onClick={() => setActiveTab('events')}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all duration-300",
                                activeTab === 'events'
                                    ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-white shadow-sm"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            )}
                        >
                            <FiCalendar className={cn("w-3.5 h-3.5", activeTab === 'events' ? "text-blue-500" : "")} />
                            Events
                        </button>
                        <button
                            onClick={() => setActiveTab('ranges')}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all duration-300",
                                activeTab === 'ranges'
                                    ? "bg-white dark:bg-gray-700 text-emerald-600 dark:text-white shadow-sm"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            )}
                        >
                            <FiTarget className={cn("w-3.5 h-3.5", activeTab === 'ranges' ? "text-emerald-500" : "")} />
                            Ranges
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar-light px-6 pb-20 space-y-6">
                    {activeTab === 'events' ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Scheduled Events</h3>
                                <button
                                    onClick={undoDelete}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-all border border-blue-200 dark:border-blue-900/50"
                                >
                                    <FiRotateCcw className="w-3 h-3" /> Undo
                                </button>
                            </div>

                            {localTasks.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700/50">
                                    <div className="size-16 rounded-2xl bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700 flex items-center justify-center text-3xl">✨</div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">All caught up!</p>
                                        <p className="text-xs text-gray-500 mt-1">Double-click any date to add a new event</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid gap-3">
                                    {localTasks
                                        .slice()
                                        .sort((a, b) => a.start.getTime() - b.start.getTime())
                                        .map((event) => (
                                            <div key={event.id} className="group relative flex flex-col gap-3 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/50 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 overflow-hidden">
                                                <div className={cn('absolute top-0 left-0 w-1 h-full', colorDotClass[event.color ?? 'default'] ?? 'bg-blue-500')} />

                                                <div className="flex justify-between items-start">
                                                    <div className="space-y-1 pr-12">
                                                        <h4 className="font-bold text-sm text-gray-900 dark:text-white leading-tight">{event.title}</h4>
                                                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                            <FiCalendar className="w-3 h-3 text-blue-500" />
                                                            {format(event.start, 'MMM d, yyyy')}
                                                            <span className="text-gray-300 dark:text-gray-700">|</span>
                                                            <span className="text-blue-600 dark:text-blue-400">{format(event.start, 'hh:mm a')}</span>
                                                        </div>
                                                    </div>

                                                    <div className="absolute right-3 top-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedDateForEvent(event.start);
                                                                setSelectedEventForEdit(event);
                                                                setIsEventModalOpen(true);
                                                            }}
                                                            className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-all"
                                                        >
                                                            <FiEdit3 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => { deleteEvent(event.id); showError(`Event "${event.title}" deleted`); }}
                                                            className="p-2 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 transition-all"
                                                        >
                                                            <FiTrash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {event.description && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                                        {event.description}
                                                    </p>
                                                )}

                                                <div className="flex items-center justify-between pt-1">
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {event.tags?.map((tag) => (
                                                            <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[9px] font-black uppercase rounded-lg border border-gray-200/50 dark:border-gray-600/50">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    {event.creator && (
                                                        <div className="flex items-center gap-1.5 grayscale opacity-50">
                                                            <img
                                                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(event.creator)}&background=random`}
                                                                className="size-4 rounded-full"
                                                                alt=""
                                                            />
                                                            <span className="text-[9px] font-bold text-gray-500">{event.creator}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Mapped Ranges</h3>
                                <button
                                    onClick={undoDeleteRange}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition-all border border-emerald-200 dark:border-emerald-900/50"
                                >
                                    <FiRotateCcw className="w-3 h-3" /> Undo
                                </button>
                            </div>

                            {ranges.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700/50">
                                    <div className="size-16 rounded-2xl bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700 flex items-center justify-center text-3xl">📏</div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">No ranges defined</p>
                                        <p className="text-xs text-gray-500 mt-1">Right-click any date to start a selection</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {ranges.map((range, idx) => (
                                        <RangeCard
                                            key={range.id}
                                            range={range}
                                            idx={idx}
                                            style={getRangeStyle(range.colorIndex ?? idx)}
                                            days={Math.round((startOfDay(range.end).getTime() - startOfDay(range.start).getTime()) / 86400000) + 1}
                                            displayName={range.label || `Project Range #${idx + 1}`}
                                            description={range.description}
                                            onDelete={() => { deleteRange(range.id); showError(`Range "${range.label || `Range #${idx + 1}`}" deleted`); }}
                                            onRename={(label) => renameRange(range.id, label)}
                                            onUpdateDescription={(desc) => updateRangeDescription(range.id, desc)}
                                            onUpdateColor={(colorIndex) => updateRangeColor(range.id, colorIndex)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

// ─── EventModal ───────────────────────────────────────────────────────────────

export const EventModal = () => {
    const {
        isEventModalOpen, setIsEventModalOpen,
        selectedDateForEvent, events, setEvents,
        selectedEventForEdit, setSelectedEventForEdit,
        setIsTasksPanelOpen
    } = useCalendar();
    const { showSuccess } = useToast();

    useEffect(() => {
        if (isEventModalOpen) {
            setIsTasksPanelOpen(false);
        }
    }, [isEventModalOpen, setIsTasksPanelOpen]);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        tags: '',
        creator: '',
        color: 'default' as CalendarEvent['color'],
        type: 'task' as const,
    });

    const [isColorOpen, setIsColorOpen] = useState(false);
    const colorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (selectedEventForEdit) {
            setFormData({
                title: selectedEventForEdit.title,
                description: selectedEventForEdit.description || '',
                tags: selectedEventForEdit.tags ? selectedEventForEdit.tags.join(', ') : '',
                creator: selectedEventForEdit.creator || '',
                color: selectedEventForEdit.color || 'default',
                type: selectedEventForEdit.type || 'task',
            });
        } else {
            setFormData({ title: '', description: '', tags: '', creator: '', color: 'default', type: 'task' });
        }
    }, [selectedEventForEdit, isEventModalOpen]);

    const [liveTime, setLiveTime] = useState(new Date());
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (isEventModalOpen) {
            setLiveTime(new Date());
            timerRef.current = setInterval(() => setLiveTime(new Date()), 1000);

            const handleClickOutside = (event: MouseEvent) => {
                if (colorRef.current && !colorRef.current.contains(event.target as Node)) {
                    setIsColorOpen(false);
                }
            };
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
                if (timerRef.current) clearInterval(timerRef.current);
            };
        }
    }, [isEventModalOpen]);

    const displayDate = selectedDateForEvent || new Date();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const now = new Date();
        const startDate = selectedEventForEdit ? selectedEventForEdit.start : new Date(
            displayDate.getFullYear(),
            displayDate.getMonth(),
            displayDate.getDate(),
            now.getHours(), now.getMinutes(), now.getSeconds(),
        );

        if (selectedEventForEdit) {
            const updated = events.map(ev => ev.id === selectedEventForEdit.id ? {
                ...ev,
                title: formData.title || 'Untitled',
                description: formData.description,
                tags: formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
                creator: formData.creator,
                color: formData.color,
                type: formData.type,
            } : ev);
            setEvents(updated);
            showSuccess(`Event "${formData.title || 'Untitled'}" updated`);
            logActivity("UPDATE", "Calendar", `Updated event: ${formData.title || 'Untitled'}`);
        } else {
            const newEvent: CalendarEvent = {
                id: Math.random().toString(36).substring(7),
                start: startDate,
                end: startDate,
                title: formData.title || 'New Event',
                description: formData.description,
                tags: formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
                creator: formData.creator,
                color: formData.color,
                type: formData.type,
                createdAt: now,
            };
            setEvents([...events, newEvent]);
            showSuccess(`Event "${formData.title || 'New Event'}" created`);
            logActivity("CREATE", "Calendar", `Created event: ${formData.title || 'New Event'}`);
        }

        setFormData({ title: '', description: '', tags: '', creator: '', color: 'default', type: 'task' });
        setSelectedEventForEdit(null);
        setIsEventModalOpen(false);
    };

    const handleCancel = () => {
        setSelectedEventForEdit(null);
        setIsEventModalOpen(false);
    };

    const colorOptions: { id: CalendarEvent['color']; label: string; class: string }[] = [
        { id: 'default', label: 'Default Blue', class: 'bg-blue-500' },
        { id: 'blue', label: 'Deep Sky', class: 'bg-sky-500' },
        { id: 'green', label: 'Emerald', class: 'bg-emerald-500' },
        { id: 'pink', label: 'Rose', class: 'bg-pink-500' },
        { id: 'purple', label: 'Violet', class: 'bg-violet-500' },
        { id: 'blue', label: 'Indigo', class: 'bg-indigo-500' },
        { id: 'default', label: 'Amber', class: 'bg-amber-500' },
        { id: 'green', label: 'Teal', class: 'bg-teal-500' },
        { id: 'pink', label: 'Crimson', class: 'bg-red-500' },
        { id: 'default', label: 'Orange', class: 'bg-orange-500' },
    ];

    const activeColor = colorOptions.find(c => c.id === (formData.color || 'default')) || colorOptions[0];

    return (
        <>
            {isEventModalOpen && (
                <div
                    className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm transition-opacity duration-300"
                    onClick={handleCancel}
                />
            )}

            <div className={cn(
                'fixed top-0 right-0 bottom-0 z-[105] w-full max-w-sm flex flex-col bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-l border-gray-200 dark:border-gray-800 shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]',
                isEventModalOpen ? 'translate-x-0' : 'translate-x-full'
            )}>
                <div className="flex-1 overflow-y-auto no-scrollbar">
                    {/* Visual Flair */}
                    <div className={cn(
                        "absolute top-0 left-0 right-0 h-40 transition-colors duration-500 opacity-20 dark:opacity-30 pointer-events-none bg-gradient-to-b from-transparent to-transparent",
                        activeColor.class.replace('bg-', 'from-')
                    )} />

                    <div className="relative px-8 pt-10 pb-6 flex justify-between items-start">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <div className={cn("size-3 rounded-full animate-pulse", activeColor.class)} />
                                <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                                    {selectedEventForEdit ? 'Edit Event' : 'New Event'}
                                </h2>
                            </div>
                            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 pl-6">
                                {format(displayDate, 'EEEE, MMMM do, yyyy')}
                            </p>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
                                <div className="flex flex-col items-center">
                                    <span className="text-xl font-black tabular-nums text-gray-900 dark:text-white leading-none">
                                        {format(liveTime, 'hh:mm')}
                                    </span>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                                        {format(liveTime, 'ss')} {format(liveTime, 'a')}
                                    </span>
                                </div>
                            </div>
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mr-1">Timestamp</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="px-8 pb-10 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">Event Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-bold text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                                placeholder="What's happening?"
                                required
                                autoFocus
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-6 py-4 bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-bold text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 resize-none"
                                placeholder="Add some context or notes..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">Metadata (Tags)</label>
                                <input
                                    type="text"
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleChange}
                                    className="w-full px-5 py-3.5 bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-xs font-bold text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                                    placeholder="urgent, review..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">Organizer</label>
                                <input
                                    type="text"
                                    name="creator"
                                    value={formData.creator}
                                    onChange={handleChange}
                                    className="w-full px-5 py-3.5 bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-xs font-bold text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                                    placeholder="Your name"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">Color Marker</label>
                            <div className="relative" ref={colorRef}>
                                <button
                                    type="button"
                                    onClick={() => setIsColorOpen(!isColorOpen)}
                                    className="w-full flex items-center justify-between px-5 py-3.5 bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl hover:border-blue-500/50 transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn("size-4 rounded-full shadow-sm", activeColor.class)} />
                                        <span className="text-xs font-bold text-gray-900 dark:text-white">{activeColor.label}</span>
                                    </div>
                                    <div className={cn("size-2 rounded-full bg-gray-300 dark:bg-gray-600 transition-transform", isColorOpen && "rotate-180")} />
                                </button>

                                {isColorOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[2rem] shadow-2xl z-50 grid grid-cols-1 gap-1 animate-in slide-in-from-top-2 duration-200 overflow-y-auto max-h-56 scrollbar-hide">
                                        {colorOptions.map((opt) => (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => {
                                                    setFormData({ ...formData, color: opt.id });
                                                    setIsColorOpen(false);
                                                }}
                                                className={cn(
                                                    "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all",
                                                    formData.color === opt.id
                                                        ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                                        : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                                                )}
                                            >
                                                <div className={cn("size-3 rounded-full", opt.class)} />
                                                <span className="text-xs font-black">{opt.label}</span>
                                                {formData.color === opt.id && <div className="size-1 bg-blue-500 rounded-full ml-auto" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="flex-1 px-8 py-4 border-2 border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-all"
                            >
                                Dismiss
                            </button>
                            <button
                                type="submit"
                                className={cn(
                                    "flex-[1.5] py-4 rounded-2xl shadow-xl shadow-blue-500/20 font-black text-xs uppercase tracking-[0.2em] text-white transition-all hover:scale-[1.02] active:scale-[0.98]",
                                    activeColor.class === 'bg-blue-500' ? 'bg-blue-600' :
                                        activeColor.class === 'bg-sky-500' ? 'bg-sky-600' :
                                            activeColor.class === 'bg-emerald-500' ? 'bg-emerald-600' :
                                                activeColor.class === 'bg-pink-500' ? 'bg-pink-600' : 'bg-violet-600'
                                )}
                            >
                                {selectedEventForEdit ? 'Update Details' : 'Secure Event'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};
