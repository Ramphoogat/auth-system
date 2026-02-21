import { cn } from '../../lib/utils';
import { format, startOfDay } from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import { useCalendar, type CalendarEvent } from './calendar-context';
import { RANGE_HUES, getRangeStyle } from './calendar-utils';
import { Button } from './button';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const colorDotClass: Record<string, string> = {
    default: 'bg-primary',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    pink: 'bg-pink-500',
    purple: 'bg-purple-500',
};

// ─── TasksPanelTrigger ────────────────────────────────────────────────────────

export const TasksPanelTrigger = () => {
    const { isTasksPanelOpen, setIsTasksPanelOpen } = useCalendar();
    return (
        <Button
            size="sm"
            variant="depth"
            data-selected={isTasksPanelOpen}
            className="cursor-pointer"
            onClick={() => setIsTasksPanelOpen(!isTasksPanelOpen)}
        >
            Tasks
        </Button>
    );
};

// ─── RangeCard ────────────────────────────────────────────────────────────────

type RangeCardProps = {
    range: { start: Date; end: Date };
    idx: number;
    style: ReturnType<typeof getRangeStyle>;
    days: number;
    displayName: string;
    onDelete: () => void;
    onRename: (label: string) => void;
};

const RangeCard = ({ range, idx, style, days, displayName, onDelete, onRename }: RangeCardProps) => {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(displayName);
    const inputRef = useRef<HTMLInputElement>(null);

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

    return (
        <div
            className="group flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-muted/40 transition-colors"
            style={{ borderColor: `hsla(${RANGE_HUES[idx % RANGE_HUES.length]}, 80%, 55%, 0.3)` }}
        >
            <div className="shrink-0 size-3 rounded-full" style={{ backgroundColor: style.capBg }} />

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

                <p className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
                    {format(range.start, 'MMM d')} → {format(range.end, 'MMM d, yyyy')}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                    {days} {days === 1 ? 'day' : 'days'}
                    {range.start.getFullYear() !== range.end.getFullYear() && (
                        <span className="ml-1">across {range.end.getFullYear() - range.start.getFullYear() + 1} years</span>
                    )}
                </p>
            </div>

            <button
                type="button"
                onClick={onDelete}
                title="Delete range"
                className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 size-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 text-sm"
            >🗑</button>
        </div>
    );
};

// ─── TasksPanel ───────────────────────────────────────────────────────────────

export const TasksPanel = () => {
    const {
        isTasksPanelOpen, setIsTasksPanelOpen,
        events, deleteEvent, undoDelete,
        ranges, deleteRange, undoDeleteRange, renameRange,
        setIsEventModalOpen, setSelectedDateForEvent, setSelectedEventForEdit,
    } = useCalendar();

    return (
        <>
            {isTasksPanelOpen && (
                <div
                    className="fixed inset-0 z-[90] bg-black/30 backdrop-blur-[2px]"
                    onClick={() => setIsTasksPanelOpen(false)}
                />
            )}

            <div className={cn(
                'fixed top-0 right-0 bottom-0 z-[95] w-full max-w-sm flex flex-col bg-white dark:bg-gray-900 border-l border-border shadow-2xl transition-transform duration-300 ease-in-out',
                isTasksPanelOpen ? 'translate-x-0' : 'translate-x-full'
            )}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tasks / Events</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {events.length} event{events.length !== 1 ? 's' : ''} · {ranges.length} range{ranges.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={undoDelete}
                            title="Undo last event delete"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border bg-card hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors shadow-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 14 4 9l5-5" /><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
                            </svg>
                            Undo
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsTasksPanelOpen(false)}
                            className="size-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        >✕</button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {/* Events */}
                    <div className="px-4 pt-4 pb-2">
                        <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Events</h3>
                        {events.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 text-center py-6">
                                <div className="size-12 rounded-full bg-muted/50 flex items-center justify-center text-xl">📅</div>
                                <p className="text-sm font-medium text-muted-foreground">No events yet</p>
                                <p className="text-xs text-muted-foreground/60">Double-click a date to create one.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {events
                                    .slice()
                                    .sort((a, b) => a.start.getTime() - b.start.getTime())
                                    .map((event) => (
                                        <div key={event.id} className="group flex items-start gap-3 p-3.5 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors">
                                            <div className={cn('size-2.5 rounded-full mt-1.5 shrink-0', colorDotClass[event.color ?? 'default'] ?? 'bg-primary')} />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{event.title}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="size-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
                                                    </svg>
                                                    {format(event.start, 'MMM d, yyyy')}
                                                    <span className="font-mono font-semibold text-primary text-[11px]">@ {format(event.start, 'HH:mm:ss')}</span>
                                                </p>
                                                {event.createdAt && (
                                                    <p className="text-[10px] text-muted-foreground/50 mt-0.5 flex items-center gap-1">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="size-2.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                                                        </svg>
                                                        Created {format(event.createdAt, 'MMM d, HH:mm:ss')}
                                                    </p>
                                                )}
                                                {event.description && <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-2">{event.description}</p>}
                                                {event.tags && event.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                                        {event.tags.map((tag) => (
                                                            <span key={tag} className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] rounded-full font-medium">{tag}</span>
                                                        ))}
                                                    </div>
                                                )}
                                                {event.creator && <p className="text-[10px] text-muted-foreground/50 mt-1.5">by {event.creator}</p>}
                                            </div>
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 flex items-center">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedDateForEvent(event.start);
                                                        setSelectedEventForEdit(event);
                                                        setIsEventModalOpen(true);
                                                    }}
                                                    title="Edit event"
                                                    className="size-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-sm"
                                                >✏️</button>
                                                <button
                                                    type="button"
                                                    onClick={() => deleteEvent(event.id)}
                                                    title="Delete event"
                                                    className="size-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 text-sm"
                                                >🗑</button>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>

                    {/* Ranges */}
                    <div className="px-4 pt-4 pb-6 border-t border-border mt-2">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Ranges</h3>
                                {ranges.length > 0 && (
                                    <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">{ranges.length}</span>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={undoDeleteRange}
                                title="Undo last range delete"
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-border bg-card hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 14 4 9l5-5" /><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
                                </svg>
                                Undo
                            </button>
                        </div>

                        {ranges.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 text-center py-6">
                                <div className="size-12 rounded-full bg-muted/50 flex items-center justify-center text-xl">📐</div>
                                <p className="text-sm font-medium text-muted-foreground">No ranges yet</p>
                                <p className="text-xs text-muted-foreground/60">Right-click a date in Month or Year view to start picking a range.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {ranges.map((range, idx) => {
                                    const style = getRangeStyle(idx);
                                    const days = Math.round((startOfDay(range.end).getTime() - startOfDay(range.start).getTime()) / 86400000) + 1;
                                    const displayName = range.label || `Range #${idx + 1}`;
                                    return (
                                        <RangeCard
                                            key={range.id}
                                            range={range}
                                            idx={idx}
                                            style={style}
                                            days={days}
                                            displayName={displayName}
                                            onDelete={() => deleteRange(range.id)}
                                            onRename={(label) => renameRange(range.id, label)}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

// ─── EventModal ───────────────────────────────────────────────────────────────

export const EventModal = () => {
    const { isEventModalOpen, setIsEventModalOpen, selectedDateForEvent, events, setEvents, selectedEventForEdit, setSelectedEventForEdit } = useCalendar();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        tags: '',
        creator: '',
        color: 'default' as CalendarEvent['color'],
    });

    useEffect(() => {
        if (selectedEventForEdit) {
            setFormData({
                title: selectedEventForEdit.title,
                description: selectedEventForEdit.description || '',
                tags: selectedEventForEdit.tags ? selectedEventForEdit.tags.join(', ') : '',
                creator: selectedEventForEdit.creator || '',
                color: selectedEventForEdit.color || 'default',
            });
        } else {
            setFormData({ title: '', description: '', tags: '', creator: '', color: 'default' });
        }
    }, [selectedEventForEdit, isEventModalOpen]);

    const [liveTime, setLiveTime] = useState(new Date());
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (isEventModalOpen) {
            setLiveTime(new Date());
            timerRef.current = setInterval(() => setLiveTime(new Date()), 1000);
        } else {
            if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        }
        return () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };
    }, [isEventModalOpen]);

    if (!isEventModalOpen || !selectedDateForEvent) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const now = new Date();
        const startDate = selectedEventForEdit ? selectedEventForEdit.start : new Date(
            selectedDateForEvent.getFullYear(),
            selectedDateForEvent.getMonth(),
            selectedDateForEvent.getDate(),
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
            } : ev);
            setEvents(updated);
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
                createdAt: now,
            };
            setEvents([...events, newEvent]);
        }

        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        setFormData({ title: '', description: '', tags: '', creator: '', color: 'default' });
        setSelectedEventForEdit(null);
        setIsEventModalOpen(false);
    };

    const handleCancel = () => {
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        setSelectedEventForEdit(null);
        setIsEventModalOpen(false);
    };

    const timeStr = format(liveTime, 'HH:mm:ss');
    const ampmStr = format(liveTime, 'a');

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={handleCancel} />
            <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-primary/10 to-primary/5 pointer-events-none" />

                <div className="relative px-6 md:px-8 pt-6 md:pt-8 pb-4 flex justify-between items-start">
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{selectedEventForEdit ? 'Edit Event' : 'Add Event'}</h2>
                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {format(selectedDateForEvent, 'EEEE, MMMM d, yyyy')}
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/8 border border-primary/20 dark:bg-primary/15">
                            <span className="relative flex size-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
                                <span className="relative inline-flex rounded-full size-2 bg-primary" />
                            </span>
                            <span className="text-base font-bold tabular-nums text-primary tracking-tight">{timeStr}</span>
                            <span className="text-[10px] font-semibold text-primary/70 uppercase">{ampmStr}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground/60 mr-1">auto-stamped on create</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="px-6 md:px-8 pb-8 pt-3 space-y-4 md:space-y-5">
                    <div className="space-y-1">
                        <label htmlFor="title" className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Title</label>
                        <input id="title" type="text" name="title" value={formData.title} onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium text-gray-700 dark:text-gray-200"
                            placeholder="Event Title" required autoFocus />
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="description" className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Description</label>
                        <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium text-gray-700 dark:text-gray-200 resize-none"
                            placeholder="Add details..." />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label htmlFor="tags" className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Tags</label>
                            <input id="tags" type="text" name="tags" value={formData.tags} onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium text-gray-700 dark:text-gray-200"
                                placeholder="work, remote" />
                        </div>
                        <div className="space-y-1">
                            <label htmlFor="creator" className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Creator</label>
                            <input id="creator" type="text" name="creator" value={formData.creator} onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium text-gray-700 dark:text-gray-200"
                                placeholder="John Doe" required />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="color" className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Color</label>
                        <select id="color" name="color" value={formData.color || 'default'} onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium text-gray-700 dark:text-gray-200 cursor-pointer">
                            <option className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value="default">Default</option>
                            <option className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value="blue">Blue</option>
                            <option className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value="green">Green</option>
                            <option className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value="pink">Pink</option>
                            <option className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value="purple">Purple</option>
                        </select>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={handleCancel}
                            className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            Cancel
                        </button>
                        <button type="submit"
                            className="flex-1 bg-primary text-primary-foreground font-bold py-2.5 rounded-xl shadow-lg hover:opacity-90 transition-all">
                            {selectedEventForEdit ? 'Save Changes' : 'Create Event'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
