import { Button } from './button';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { ChevronsUpDown } from 'lucide-react';
import {
    type Locale,
    addDays,
    addMonths,
    addWeeks,
    addYears,
    format,
    setYear,
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
import { useHotkeys } from 'react-hotkeys-hook';
import { CalendarDayView, CalendarWeekView, CalendarMonthView, CalendarYearView } from './CalendarViews';
import { TasksPanel, TasksPanelTrigger, EventModal } from './TasksPanel';
import { fetchCalendarData, saveCalendarData } from '../../api/calendar';

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
};

const Calendar = ({
    children,
    defaultDate = new Date(),
    locale = enUS,
    enableHotkeys = true,
    view: _defaultMode = 'month',
    onEventClick,
    events: defaultEvents = [],
    onChangeView,
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
        fetchCalendarData()
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
        setEvents((prev) => { deletedEventsStack.current.push(prev); return prev.filter((e) => e.id !== id); });
    }, []);

    const undoDelete = useCallback(() => {
        if (deletedEventsStack.current.length > 0) setEvents(deletedEventsStack.current.pop()!);
    }, []);

    const addRange = useCallback((range: DateRange) => {
        setRanges((prev) => [...prev, range]);
    }, []);

    const deleteRange = useCallback((id: string) => {
        setRanges((prev) => { deletedRangesStack.current.push(prev); return prev.filter((r) => r.id !== id); });
    }, []);

    const undoDeleteRange = useCallback(() => {
        if (deletedRangesStack.current.length > 0) setRanges(deletedRangesStack.current.pop()!);
    }, []);

    const renameRange = useCallback((id: string, label: string) => {
        setRanges((prev) => prev.map((r) => r.id === id ? { ...r, label } : r));
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
            deleteEvent, undoDelete,
            ranges, draftStart, setDraftStart,
            addRange, deleteRange, undoDeleteRange, renameRange,
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
>(({ children, onClick, ...props }, ref) => {
    const { date, setDate, view, enableHotkeys } = useCalendar();

    const next = useCallback(() => {
        if (view === 'day') setDate(addDays(date, 1));
        else if (view === 'week') setDate(addWeeks(date, 1));
        else if (view === 'month') setDate(addMonths(date, 1));
        else if (view === 'year') setDate(addYears(date, 1));
    }, [date, view, setDate]);

    useHotkeys('ArrowRight', () => next(), { enabled: enableHotkeys });

    return (
        <Button size="icon" variant="outline" ref={ref} {...props}
            onClick={(e) => { next(); onClick?.(e); }}>
            {children}
        </Button>
    );
});
CalendarNextTrigger.displayName = 'CalendarNextTrigger';

// ─── CalendarPrevTrigger ──────────────────────────────────────────────────────

const CalendarPrevTrigger = forwardRef<
    HTMLButtonElement,
    React.HTMLAttributes<HTMLButtonElement>
>(({ children, onClick, ...props }, ref) => {
    const { date, setDate, view, enableHotkeys } = useCalendar();

    const prev = useCallback(() => {
        if (view === 'day') setDate(subDays(date, 1));
        else if (view === 'week') setDate(subWeeks(date, 1));
        else if (view === 'month') setDate(subMonths(date, 1));
        else if (view === 'year') setDate(subYears(date, 1));
    }, [date, view, setDate]);

    useHotkeys('ArrowLeft', () => prev(), { enabled: enableHotkeys });

    return (
        <Button size="icon" variant="outline" ref={ref} {...props}
            onClick={(e) => { prev(); onClick?.(e); }}>
            {children}
        </Button>
    );
});
CalendarPrevTrigger.displayName = 'CalendarPrevTrigger';

// ─── CalendarTodayTrigger ─────────────────────────────────────────────────────

const CalendarTodayTrigger = forwardRef<
    HTMLButtonElement,
    React.HTMLAttributes<HTMLButtonElement>
>(({ children, onClick, ...props }, ref) => {
    const { setDate, setView, enableHotkeys, onChangeView } = useCalendar();

    const jumpToToday = useCallback(() => {
        setDate(new Date());
        setView('month');
        onChangeView?.('month');
    }, [setDate, setView, onChangeView]);

    useHotkeys('t', () => jumpToToday(), { enabled: enableHotkeys });

    return (
        <Button variant="outline" ref={ref} {...props}
            onClick={(e) => { jumpToToday(); onClick?.(e); }}>
            {children}
        </Button>
    );
});
CalendarTodayTrigger.displayName = 'CalendarTodayTrigger';

// ─── CalendarCurrentDate ──────────────────────────────────────────────────────

const CalendarCurrentDate = () => {
    const { date, view, setDate } = useCalendar();
    const currentYear = date.getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - 50 + i);

    return (
        <time dateTime={date.toISOString()} className="tabular-nums flex items-center gap-2 group">
            <span>{format(date, view === 'day' ? 'dd MMMM' : 'MMMM')}</span>
            <div className="relative flex items-center rounded-lg border border-border/80 bg-black/5 dark:bg-black/20 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_6px_rgba(0,0,0,0.4)] px-3 py-1">
                <select
                    value={currentYear}
                    onChange={(e) => setDate(setYear(date, parseInt(e.target.value)))}
                    className="bg-transparent appearance-none cursor-pointer outline-none font-bold pr-5 z-10"
                >
                    {years.map((y) => (
                        <option key={y} value={y} className="text-white dark:text-black bg-black/50 dark:bg-black/50 font-medium">
                            {y}
                        </option>
                    ))}
                </select>
                <ChevronsUpDown className="w-4 h-4 text-muted-foreground absolute right-2 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
        </time>
    );
};

// ─── Exports ──────────────────────────────────────────────────────────────────

export {
    Calendar,
    CalendarCurrentDate,
    CalendarNextTrigger,
    CalendarPrevTrigger,
    CalendarTodayTrigger,
    CalendarViewTrigger,
};

export { CalendarDayView, CalendarWeekView, CalendarMonthView, CalendarYearView } from './CalendarViews';
export { TasksPanel, TasksPanelTrigger, EventModal } from './TasksPanel';

// ─── CalendarApp (entry point) ────────────────────────────────────────────────

export default function CalendarApp() {
    return (
        <Calendar>
            <div className="h-full flex flex-col space-y-4">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <CalendarViewTrigger className="cursor-pointer" view="day">Day</CalendarViewTrigger>
                        <CalendarViewTrigger className="cursor-pointer" view="week">Week</CalendarViewTrigger>
                        <CalendarViewTrigger className="cursor-pointer" view="month">Month</CalendarViewTrigger>
                        <CalendarViewTrigger className="cursor-pointer" view="year">Year</CalendarViewTrigger>
                        <TasksPanelTrigger />
                    </div>

                    <div className="flex items-center gap-4 text-lg md:text-xl font-bold order-first md:order-none w-full md:w-auto justify-center md:justify-start">
                        <CalendarCurrentDate />
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
                        <CalendarPrevTrigger className="cursor-pointer"><FiChevronLeft /></CalendarPrevTrigger>
                        <CalendarTodayTrigger className="cursor-pointer">Today</CalendarTodayTrigger>
                        <CalendarNextTrigger className="cursor-pointer"><FiChevronRight /></CalendarNextTrigger>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden rounded-md border border-border bg-card">
                    <CalendarDayView />
                    <CalendarWeekView />
                    <CalendarMonthView />
                    <CalendarYearView />
                </div>
            </div>
            <EventModal />
            <TasksPanel />
        </Calendar>
    );
}
