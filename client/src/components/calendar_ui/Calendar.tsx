import { cn } from '../../lib/utils';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { ChevronsUpDown } from 'lucide-react';
import {
    type Locale,
    addDays,
    addMonths,
    addWeeks,
    addYears,
    subDays,
    subMonths,
    subWeeks,
    subYears,
} from 'date-fns';
import { enUS } from 'date-fns/locale';
import {
    type ReactNode,
    forwardRef,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import {
    Context,
    useCalendar,
    type CalendarEvent,
    type DateRange,
    type View,
} from './calendar-context';
import { CalendarDayView, CalendarWeekView, CalendarMonthView, CalendarYearView } from './CalendarViews';
import { useHotkeys } from 'react-hotkeys-hook';
import { TasksPanel, TasksPanelTrigger, EventModal } from './TasksPanel';
import { saveCalendarData, syncCalendarData } from '../../api/calendar';
import { Button } from './button';
import type { RangeMatch } from './calendar-utils';
import { logActivity } from '../../utils/activityLogger';

declare global {
    interface Window {
        calendar_helpers: {
            setSelectedDateForEvent: (date: Date | null) => void;
            setIsEventModalOpen: (open: boolean) => void;
            draftStart: Date | null;
            setDraftStart: (d: Date | null) => void;
            addRange: (range: DateRange) => void;
            renameRange: (id: string, label: string) => void;
            updateRangeDescription: (id: string, description: string) => void;
            updateEventTitle?: (id: string, title: string) => void;
            updateEventDescription?: (id: string, description: string) => void;
            toggleLock: (e: React.MouseEvent, _date: Date, rangeMatches: RangeMatch[]) => void;
        };
    }
}
// ─── Calendar (Context Provider) ─────────────────────────────────────────────

type CalendarProps = {
    children: ReactNode;
    defaultDate?: Date;
    events?: CalendarEvent[];
    view?: View;
    locale?: Locale;
    enableHotkeys?: boolean;
    onChangeView?: (view: View) => void;
    onEventClick?: (event: CalendarEvent) => void;
    readOnly?: boolean;
};

export const Calendar = ({
    children,
    defaultDate = new Date(),
    events: defaultEvents = [],
    view: _defaultMode = 'month',
    locale = enUS,
    enableHotkeys = true,
    onEventClick,
    onChangeView,
    readOnly = false,
}: CalendarProps) => {
    const [view, setView] = useState<View>(_defaultMode);
    const [date, setDate] = useState(defaultDate);
    const [events, setEvents] = useState<CalendarEvent[]>(defaultEvents);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [selectedDateForEvent, setSelectedDateForEvent] = useState<Date | null>(null);
    const [selectedEventForEdit, setSelectedEventForEdit] = useState<CalendarEvent | null>(null);
    const [isTasksPanelOpen, setIsTasksPanelOpen] = useState(false);
    const [ranges, setRanges] = useState<DateRange[]>([]);
    const [draftStart, setDraftStart] = useState<Date | null>(null);

    const deletedEventsStack = useRef<CalendarEvent[][]>([]);
    const deletedRangesStack = useRef<DateRange[][]>([]);
    // Prevents saving the data we just loaded back to the server immediately
    const syncedRef = useRef(false);
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── Load from DB on mount ──────────────────────────────────────────────────
    useEffect(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
            syncedRef.current = true;
            return;
        }

        syncCalendarData()
            .then(({ events: savedEvents, ranges: savedRanges }) => {
                if (savedEvents.length > 0) setEvents(savedEvents);
                if (savedRanges.length > 0) setRanges(savedRanges);
            })
            .catch(() => {
                // Not logged in or network error — continue with local state
            })
            .finally(() => {
                syncedRef.current = true;
            });
    }, []);

    // ── Debounced auto-save whenever events or ranges change ───────────────────
    useEffect(() => {
        if (!syncedRef.current) return; // skip the initial load echo
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) return; // Disallow saving if not authenticated
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
            saveCalendarData({ events, ranges }).catch(() => {
                // silently ignore — user may not be authenticated yet
            });
        }, 1000);
        return () => {
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        };
    }, [events, ranges]);

    const changeView = (v: View) => { setView(v); onChangeView?.(v); };

    useHotkeys('m', () => changeView('month'), { enabled: enableHotkeys });
    useHotkeys('w', () => changeView('week'), { enabled: enableHotkeys });
    useHotkeys('y', () => changeView('year'), { enabled: enableHotkeys });
    useHotkeys('d', () => changeView('day'), { enabled: enableHotkeys });

    const deleteEvent = useCallback((id: string) => {
        setEvents((prev) => {
            const ev = prev.find(e => e.id === id);
            if (ev) logActivity("DELETE", "Calendar", `Deleted event: ${ev.title}`);
            deletedEventsStack.current.push(prev);
            return prev.filter((e) => e.id !== id);
        });
    }, []);

    const clearAllEvents = useCallback(() => {
        logActivity("DELETE", "Calendar", `Cleared all events from calendar`);
        setEvents((prev) => { deletedEventsStack.current.push(prev); return []; });
    }, []);

    const updateEventTitle = useCallback((id: string, title: string) => {
        logActivity("UPDATE", "Calendar", `Renamed event to ${title}`);
        setEvents((prev) => prev.map((e) => e.id === id ? { ...e, title } : e));
    }, []);

    const updateEventDescription = useCallback((id: string, description: string) => {
        logActivity("UPDATE", "Calendar", `Updated event description`);
        setEvents((prev) => prev.map((e) => e.id === id ? { ...e, description } : e));
    }, []);

    const undoDelete = useCallback(() => {
        if (deletedEventsStack.current.length > 0) setEvents(deletedEventsStack.current.pop()!);
    }, []);

    const addRange = useCallback((range: DateRange) => {
        logActivity("CREATE", "Calendar", `Created time range: ${range.label || "Untitled"}`);
        setRanges((prev) => [...prev, range]);
    }, []);

    const deleteRange = useCallback((id: string) => {
        setRanges((prev) => {
            const r = prev.find(rng => rng.id === id);
            if (r) logActivity("DELETE", "Calendar", `Deleted time range: ${r.label || "Untitled"}`);
            deletedRangesStack.current.push(prev);
            return prev.filter((r) => r.id !== id);
        });
    }, []);

    const undoDeleteRange = useCallback(() => {
        if (deletedRangesStack.current.length > 0) setRanges(deletedRangesStack.current.pop()!);
    }, []);

    const renameRange = useCallback((id: string, label: string) => {
        logActivity("UPDATE", "Calendar", `Renamed time range to ${label}`);
        setRanges((prev) => prev.map((r) => r.id === id ? { ...r, label } : r));
    }, []);

    const updateRangeDescription = useCallback((id: string, description: string) => {
        logActivity("UPDATE", "Calendar", `Updated time range description`);
        setRanges((prev) => prev.map((r) => r.id === id ? { ...r, description } : r));
    }, []);

    const updateRangeColor = useCallback((id: string, colorIndex: number) => {
        logActivity("UPDATE", "Calendar", `Changed time range color`);
        setRanges((prev) => prev.map((r) => r.id === id ? { ...r, colorIndex } : r));
    }, []);

    return (
        <Context.Provider value={{
            view, setView, date, setDate, events, setEvents,
            locale, enableHotkeys, onEventClick, onChangeView,
            today: new Date(),
            isEventModalOpen, setIsEventModalOpen,
            selectedDateForEvent, setSelectedDateForEvent,
            selectedEventForEdit, setSelectedEventForEdit,
            isTasksPanelOpen, setIsTasksPanelOpen,
            deleteEvent, clearAllEvents, undoDelete,
            updateEventTitle, updateEventDescription,
            ranges, draftStart, setDraftStart,
            addRange, deleteRange, undoDeleteRange, renameRange, updateRangeDescription, updateRangeColor,
            readOnly,
        }}>
            {children}
        </Context.Provider>
    );
};

// ─── CalendarViewTrigger ──────────────────────────────────────────────────────

const CalendarViewTrigger = forwardRef<
    HTMLButtonElement,
    React.HTMLAttributes<HTMLButtonElement> & { view: View }
>(({ children, view, ...props }, ref) => {
    const { view: currentView, setView, onChangeView } = useCalendar();
    return (
        <Button
            ref={ref}
            data-selected={currentView === view}
            size="sm"
            variant="depth"
            {...props}
            onClick={() => { setView(view); onChangeView?.(view); }}
        >
            {children}
        </Button>
    );
});
CalendarViewTrigger.displayName = 'CalendarViewTrigger';

// ─── CalendarNextTrigger ──────────────────────────────────────────────────────

const CalendarNextTrigger = forwardRef<
    HTMLButtonElement,
    React.HTMLAttributes<HTMLButtonElement>
>(({ className, onClick, ...props }, ref) => {
    const { date, setDate, view, enableHotkeys } = useCalendar();

    const next = useCallback(() => {
        if (view === 'day') setDate(addDays(date, 1));
        else if (view === 'week') setDate(addWeeks(date, 1));
        else if (view === 'month') setDate(addMonths(date, 1));
        else if (view === 'year') setDate(addYears(date, 1));
    }, [date, view, setDate]);

    useHotkeys('ArrowRight', () => next(), { enabled: enableHotkeys });

    return (
        <button
            ref={ref}
            onClick={(e) => { next(); onClick?.(e); }}
            className={cn(
                "size-8 md:size-10 flex items-center justify-center rounded-xl transition-all duration-300",
                "bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border border-gray-200 dark:border-gray-700",
                "hover:border-gray-900/20 dark:hover:border-white/20 hover:bg-white dark:hover:bg-gray-700 hover:shadow-lg active:scale-95",
                className
            )}
            {...props}
        >
            <FiChevronRight className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400" />
        </button>
    );
});
CalendarNextTrigger.displayName = 'CalendarNextTrigger';

const CalendarPrevTrigger = forwardRef<
    HTMLButtonElement,
    React.HTMLAttributes<HTMLButtonElement>
>(({ className, onClick, ...props }, ref) => {
    const { date, setDate, view, enableHotkeys } = useCalendar();

    const prev = useCallback(() => {
        if (view === 'day') setDate(subDays(date, 1));
        else if (view === 'week') setDate(subWeeks(date, 1));
        else if (view === 'month') setDate(subMonths(date, 1));
        else if (view === 'year') setDate(subYears(date, 1));
    }, [date, view, setDate]);

    useHotkeys('ArrowLeft', () => prev(), { enabled: enableHotkeys });

    return (
        <button
            ref={ref}
            onClick={(e) => { prev(); onClick?.(e); }}
            className={cn(
                "size-8 md:size-10 flex items-center justify-center rounded-xl transition-all duration-300",
                "bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border border-gray-200 dark:border-gray-700",
                "hover:border-gray-900/20 dark:hover:border-white/20 hover:bg-white dark:hover:bg-gray-700 hover:shadow-lg active:scale-95",
                className
            )}
            {...props}
        >
            <FiChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400" />
        </button>
    );
});
CalendarPrevTrigger.displayName = 'CalendarPrevTrigger';

const CalendarTodayTrigger = forwardRef<
    HTMLButtonElement,
    React.HTMLAttributes<HTMLButtonElement>
>(({ className, onClick, ...props }, ref) => {
    const { setDate, setView, enableHotkeys, onChangeView } = useCalendar();

    const jumpToToday = useCallback(() => {
        setDate(new Date());
        setView('month');
        onChangeView?.('month');
    }, [setDate, setView, onChangeView]);

    useHotkeys('t', () => jumpToToday(), { enabled: enableHotkeys });

    return (
        <button
            ref={ref}
            onClick={(e) => { jumpToToday(); onClick?.(e); }}
            className={cn(
                "px-3 py-1.5 md:px-5 md:py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-[0.15em] transition-all duration-300",
                "bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border border-gray-200 dark:border-gray-700",
                "text-emerald-600 dark:text-emerald-400 hover:text-gray-900 dark:hover:text-white",
                "hover:border-gray-900/20 dark:hover:border-white/20 hover:bg-white dark:hover:bg-gray-700 hover:shadow-lg active:scale-95",
                className
            )}
            {...props}
        >
            Today
        </button>
    );
});
CalendarTodayTrigger.displayName = 'CalendarTodayTrigger';

const CalendarCurrentDate = () => {
    const { date, setDate } = useCalendar();
    const [isYearOpen, setIsYearOpen] = useState(false);
    const [isMonthOpen, setIsMonthOpen] = useState(false);
    const yearRef = useRef<HTMLDivElement>(null);
    const monthRef = useRef<HTMLDivElement>(null);

    const currentYear = date.getFullYear();
    const currentMonth = date.getMonth();
    const years = Array.from({ length: 201 }, (_, i) => 1900 + i);
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (yearRef.current && !yearRef.current.contains(event.target as Node)) setIsYearOpen(false);
            if (monthRef.current && !monthRef.current.contains(event.target as Node)) setIsMonthOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isYearOpen) {
            const activeYear = document.getElementById(`year-opt-${currentYear}`);
            if (activeYear) activeYear.scrollIntoView({ block: 'center', behavior: 'auto' });
        }
    }, [isYearOpen, currentYear]);

    return (
        <div className="flex items-center gap-2 md:gap-4">
            <div className="relative" ref={monthRef}>
                <button
                    onClick={() => setIsMonthOpen(!isMonthOpen)}
                    className={cn(
                        "group flex items-center gap-2 px-4 py-2 rounded-2xl transition-all duration-300",
                        "hover:bg-gray-100 dark:hover:bg-gray-800/50",
                        isMonthOpen && "bg-gray-100 dark:bg-gray-800/50"
                    )}
                >
                    <span className="text-xl md:text-2xl font-black text-emerald-500 dark:text-emerald-500 tracking-tight">
                        {months[currentMonth]}
                    </span>
                    <ChevronsUpDown className={cn(
                        "w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors",
                        isMonthOpen && "text-gray-500"
                    )} />
                </button>

                {isMonthOpen && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[2rem] shadow-2xl z-[110] animate-in fade-in zoom-in-95 duration-200 overflow-hidden p-1.5 scrollbar-hide">
                        <div className="grid grid-cols-1 gap-1 max-h-80 overflow-y-auto">
                            {months.map((m, idx) => (
                                <button
                                    key={m}
                                    onClick={() => {
                                        const newDate = new Date(date);
                                        newDate.setMonth(idx);
                                        setDate(newDate);
                                        setIsMonthOpen(false);
                                    }}
                                    className={cn(
                                        "w-full px-4 py-2.5 rounded-2xl text-sm font-bold transition-all text-left flex items-center justify-between",
                                        idx === currentMonth
                                            ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                                            : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                                    )}
                                >
                                    {m}
                                    {idx === currentMonth && <div className="size-1.5 rounded-full bg-current" />}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="relative" ref={yearRef}>
                <button
                    onClick={() => setIsYearOpen(!isYearOpen)}
                    className={cn(
                        "group flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-300",
                        "bg-blue-50/50 dark:bg-blue-500/5 backdrop-blur-md border-blue-200/50 dark:border-blue-500/20",
                        "hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10",
                        isYearOpen && "border-blue-500 ring-2 ring-blue-500/20 shadow-lg shadow-blue-500/10"
                    )}
                >
                    <span className="font-black text-blue-600 dark:text-blue-400 tabular-nums">
                        {currentYear}
                    </span>
                    <ChevronsUpDown className={cn(
                        "w-3.5 h-3.5 text-blue-300 group-hover:text-blue-500 transition-colors",
                        isYearOpen && "text-blue-500"
                    )} />
                </button>

                {isYearOpen && (
                    <div className="absolute top-full left-0 mt-2 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-[110] animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="max-h-60 overflow-y-auto custom-scrollbar-light p-1.5 space-y-1">
                            {years.map((y) => (
                                <button
                                    key={y}
                                    id={`year-opt-${y}`}
                                    onClick={() => {
                                        const newDate = new Date(date);
                                        newDate.setFullYear(y);
                                        setDate(newDate);
                                        setIsYearOpen(false);
                                    }}
                                    className={cn(
                                        "w-full px-3 py-2 rounded-xl text-sm font-bold transition-all text-left",
                                        y === currentYear
                                            ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400"
                                    )}
                                >
                                    {y}
                                </button>
                            ))}
                        </div>
                        <div className="p-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 text-center">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Year</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Exports ──────────────────────────────────────────────────────────────────

export {
    CalendarCurrentDate,
    CalendarNextTrigger,
    CalendarPrevTrigger,
    CalendarTodayTrigger,
    CalendarViewTrigger,
};

export { CalendarDayView, CalendarWeekView, CalendarMonthView, CalendarYearView } from './CalendarViews';
export { TasksPanel, TasksPanelTrigger, EventModal } from './TasksPanel';

// ─── CalendarApp (entry point) ────────────────────────────────────────────────

export default function CalendarApp({ readOnly = false }: { readOnly?: boolean }) {
    return (
        <Calendar readOnly={readOnly}>
            <CalendarAppInner />
        </Calendar>
    );
}

function CalendarAppInner() {
    const {
        view: contextView, setView: setContextView, onChangeView, readOnly,
        setSelectedDateForEvent, setIsEventModalOpen, draftStart, setDraftStart, addRange,
        renameRange, updateRangeDescription, updateEventTitle, updateEventDescription
    } = useCalendar();
    const [isViewOpen, setIsViewOpen] = useState(false);
    const viewRef = useRef<HTMLDivElement>(null);

    // Expose helpers for the tooltip portal (mobile actions)
    useEffect(() => {
        window.calendar_helpers = {
            setSelectedDateForEvent,
            setIsEventModalOpen,
            draftStart,
            setDraftStart,
            addRange,
            renameRange,
            updateRangeDescription,
            updateEventTitle,
            updateEventDescription,
            toggleLock: () => { } // Placeholder
        };
    }, [setSelectedDateForEvent, setIsEventModalOpen, draftStart, setDraftStart, addRange, renameRange, updateRangeDescription, updateEventTitle, updateEventDescription]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (viewRef.current && !viewRef.current.contains(event.target as Node)) {
                setIsViewOpen(false);
            }
        };
        if (isViewOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isViewOpen]);

    const viewOptions = [
        { id: 'day', label: 'Day View' },
        { id: 'week', label: 'Week View' },
        { id: 'month', label: 'Month View' },
        { id: 'year', label: 'Year View' },
    ] as const;

    return (
        <div className="h-full flex flex-col space-y-4 md:space-y-6">
            <div className="flex flex-col xl:flex-row items-center justify-between gap-4 md:gap-6">
                {/* Mobile: Date selectors at the top, centered */}
                <div className="flex items-center justify-center gap-4 w-full xl:w-auto xl:order-none order-first">
                    <CalendarCurrentDate />
                </div>

                <div className="flex items-center justify-between xl:justify-start gap-3 w-full xl:w-auto">
                    <div className="relative flex-1 md:flex-none" ref={viewRef}>
                        <button
                            onClick={() => setIsViewOpen(!isViewOpen)}
                            className={cn(
                                "group relative flex items-center gap-2.5 px-4 md:px-5 py-2.5 rounded-[1.25rem] border transition-all duration-300 w-full md:min-w-[150px] text-emerald-500",
                                "bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border-gray-200 dark:border-gray-700",
                                "hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10",
                                isViewOpen && "border-emerald-500 ring-4 ring-emerald-500/10 shadow-xl shadow-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            )}
                        >
                            <span className="font-black capitalize text-[10px] md:text-xs uppercase tracking-widest truncate">
                                {contextView} view
                            </span>
                            <ChevronsUpDown className={cn(
                                "w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-500 transition-colors ml-auto shrink-0",
                                isViewOpen && "text-emerald-500"
                            )} />
                        </button>

                        {isViewOpen && (
                            <div className="absolute top-full left-0 mt-3 w-full md:w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[2rem] shadow-2xl z-[120] animate-in fade-in zoom-in-95 duration-200 overflow-hidden p-2">
                                <div className="space-y-1">
                                    {viewOptions.map((opt) => (
                                        <button
                                            key={opt.id}
                                            onClick={() => {
                                                setContextView(opt.id);
                                                if (onChangeView) onChangeView(opt.id);
                                                setIsViewOpen(false);
                                            }}
                                            className={cn(
                                                "w-full px-5 py-3 rounded-2xl text-sm font-bold transition-all text-left flex items-center justify-between",
                                                contextView === opt.id
                                                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                                                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-emerald-600 dark:hover:text-emerald-400"
                                            )}
                                        >
                                            {opt.label}
                                            {contextView === opt.id && <div className="size-1.5 rounded-full bg-white animate-pulse" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    {!readOnly && <TasksPanelTrigger />}
                </div>

                <div className="flex items-center gap-3 w-full xl:w-auto justify-center xl:justify-end">
                    <div className="flex items-center bg-gray-100/50 dark:bg-gray-800/30 backdrop-blur-sm p-1 md:p-1.5 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                        <CalendarPrevTrigger />
                        <div className="w-[1px] h-4 bg-gray-200 dark:bg-gray-700 mx-1" />
                        <CalendarTodayTrigger className="bg-transparent border-none shadow-none hover:bg-gray-200/50 dark:hover:bg-gray-700/50" />
                        <div className="w-[1px] h-4 bg-gray-200 dark:bg-gray-700 mx-1" />
                        <CalendarNextTrigger />
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-hidden rounded-[2.5rem] border border-gray-200/50 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl">
                <CalendarDayView />
                <CalendarWeekView />
                <CalendarMonthView />
                <CalendarYearView />
            </div>
            <EventModal />
            <TasksPanel />
        </div>
    );
}
