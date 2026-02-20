import { Button } from './calendar_ui/button';
import { cn } from '../lib/utils';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { ChevronsUpDown } from 'lucide-react';
import {
    type Locale,
    addDays,
    addMonths,
    addWeeks,
    addYears,
    differenceInMinutes,
    format,
    getMonth,
    isSameDay,
    isSameHour,
    isSameMonth,
    isToday,
    setHours,
    setMonth,
    setYear,
    startOfMonth,
    startOfWeek,
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
    useMemo,
    useState,
} from 'react';
import {
    Context,
    dayEventVariants,
    monthEventVariants,
    useCalendar,
    type CalendarEvent,
    type View,
} from './calendar-context';
import { useHotkeys } from 'react-hotkeys-hook';



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

    const changeView = (view: View) => {
        setView(view);
        onChangeView?.(view);
    };

    useHotkeys('m', () => changeView('month'), {
        enabled: enableHotkeys,
    });

    useHotkeys('w', () => changeView('week'), {
        enabled: enableHotkeys,
    });

    useHotkeys('y', () => changeView('year'), {
        enabled: enableHotkeys,
    });

    useHotkeys('d', () => changeView('day'), {
        enabled: enableHotkeys,
    });

    return (
        <Context.Provider
            value={{
                view,
                setView,
                date,
                setDate,
                events,
                setEvents,
                locale,
                enableHotkeys,
                onEventClick,
                onChangeView,
                today: new Date(),
                isEventModalOpen,
                setIsEventModalOpen,
                selectedDateForEvent,
                setSelectedDateForEvent,
            }}
        >
            {children}
        </Context.Provider>
    );
};



const CalendarViewTrigger = forwardRef<
    HTMLButtonElement,
    React.HTMLAttributes<HTMLButtonElement> & {
        view: View;
    }
>(({ children, view, ...props }, ref) => {
    const { view: currentView, setView, onChangeView } = useCalendar();

    return (
        <Button
            ref={ref}
            data-selected={currentView === view}
            size="sm"
            variant="depth"
            {...props}
            onClick={() => {
                setView(view);
                onChangeView?.(view);
            }}
        >
            {children}
        </Button>
    );
});
CalendarViewTrigger.displayName = 'CalendarViewTrigger';

const EventGroup = ({
    events,
    hour,
}: {
    events: CalendarEvent[];
    hour: Date;
}) => {
    return (
        <div className="h-20 border-t last:border-b">
            {events
                .filter((event) => isSameHour(event.start, hour))
                .map((event) => {
                    const hoursDifference =
                        differenceInMinutes(event.end, event.start) / 60;
                    const startPosition = event.start.getMinutes() / 60;

                    return (
                        <div
                            key={event.id}
                            className={cn(
                                'relative',
                                dayEventVariants({ variant: event.color })
                            )}
                            style={{
                                top: `${startPosition * 100}%`,
                                height: `${hoursDifference * 100}%`,
                            }}
                        >
                            {event.title}
                        </div>
                    );
                })}
        </div>
    );
};

const CalendarDayView = () => {
    const { view, events, date } = useCalendar();

    if (view !== 'day') return null;

    const hours = [...Array(24)].map((_, i) => setHours(date, i));

    return (
        <div className="flex relative pt-2 overflow-auto h-full">
            <TimeTable />
            <div className="flex-1">
                {hours.map((hour) => (
                    <EventGroup key={hour.toString()} hour={hour} events={events} />
                ))}
            </div>
        </div>
    );
};

const CalendarWeekView = () => {
    const { view, date, locale, events } = useCalendar();

    const weekDates = useMemo(() => {
        const start = startOfWeek(date, { weekStartsOn: 0 });
        const weekDates = [];

        for (let i = 0; i < 7; i++) {
            const day = addDays(start, i);
            const hours = [...Array(24)].map((_, i) => setHours(day, i));
            weekDates.push(hours);
        }

        return weekDates;
    }, [date]);

    const headerDays = useMemo(() => {
        const daysOfWeek = [];
        for (let i = 0; i < 7; i++) {
            const result = addDays(startOfWeek(date, { weekStartsOn: 0 }), i);
            daysOfWeek.push(result);
        }
        return daysOfWeek;
    }, [date]);

    if (view !== 'week') return null;

    return (
        <div className="flex flex-col relative overflow-auto h-full">
            <div className="flex sticky top-0 bg-card z-10 border-b mb-3">
                <div className="w-12"></div>
                {headerDays.map((date, i) => (
                    <div
                        key={date.toString()}
                        className={cn(
                            'text-center flex-1 gap-1 pb-2 text-sm text-muted-foreground flex items-center justify-center',
                            [0, 6].includes(i) && 'text-muted-foreground/50'
                        )}
                    >
                        {format(date, 'E', { locale })}
                        <span
                            className={cn(
                                'h-6 grid place-content-center',
                                isToday(date) &&
                                'bg-primary text-primary-foreground rounded-full size-6'
                            )}
                        >
                            {format(date, 'd')}
                        </span>
                    </div>
                ))}
            </div>
            <div className="flex flex-1">
                <div className="w-fit">
                    <TimeTable />
                </div>
                <div className="grid grid-cols-7 flex-1">
                    {weekDates.map((hours, i) => {
                        return (
                            <div
                                className={cn(
                                    'h-full text-sm text-muted-foreground border-l first:border-l-0',
                                    [0, 6].includes(i) && 'bg-muted/50'
                                )}
                                key={hours[0].toString()}
                            >
                                {hours.map((hour) => (
                                    <EventGroup
                                        key={hour.toString()}
                                        hour={hour}
                                        events={events}
                                    />
                                ))}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const CalendarMonthView = () => {
    const { date, setDate, today, view, events, locale, setSelectedDateForEvent, setIsEventModalOpen } = useCalendar();

    const monthDates = useMemo(() => getDaysInMonth(date), [date]);
    const weekDays = useMemo(() => generateWeekdays(locale), [locale]);

    if (view !== 'month') return null;

    return (
        <div className="h-full flex flex-col">
            <div className="grid grid-cols-7 gap-px sticky top-0 bg-background border-b">
                {weekDays.map((day, i) => (
                    <div
                        key={day}
                        className={cn(
                            'mb-2 text-center text-sm text-muted-foreground pr-2',
                            [0, 6].includes(i) && 'text-muted-foreground/50'
                        )}
                    >
                        {day}
                    </div>
                ))}
            </div>
            <div className="grid overflow-hidden -mt-px flex-1 auto-rows-fr p-px grid-cols-7 gap-px">
                {monthDates.map((_date) => {
                    const currentEvents = events.filter((event) =>
                        isSameDay(event.start, _date)
                    );

                    return (
                        <div
                            onClick={() => setDate(_date)}
                            onDoubleClick={() => {
                                setSelectedDateForEvent(_date);
                                setIsEventModalOpen(true);
                            }}
                            className={cn(
                                'ring-1 p-2 text-sm text-muted-foreground ring-border overflow-auto cursor-pointer hover:bg-muted/50 transition-colors',
                                !isSameMonth(date, _date) && 'text-muted-foreground/50',
                                isSameDay(date, _date) && 'bg-muted/10'
                            )}
                            key={_date.toString()}
                        >
                            <span
                                className={cn(
                                    'size-6 grid place-items-center rounded-full mb-1 sticky top-0',
                                    isSameDay(date, _date) && 'bg-primary/30 text-primary font-medium',
                                    isSameDay(today, _date) && 'bg-primary text-primary-foreground font-normal'
                                )}
                            >
                                {format(_date, 'd')}
                            </span>

                            {currentEvents.map((event) => {
                                return (
                                    <div
                                        key={event.id}
                                        className="px-1 rounded text-sm flex items-center gap-1"
                                    >
                                        <div
                                            className={cn(
                                                'shrink-0',
                                                monthEventVariants({ variant: event.color })
                                            )}
                                        ></div>
                                        <span className="flex-1 truncate">{event.title}</span>
                                        <time className="tabular-nums text-muted-foreground/50 text-xs">
                                            {format(event.start, 'HH:mm')}
                                        </time>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const CalendarYearView = () => {
    const { view, date, today, locale, setDate, setSelectedDateForEvent, setIsEventModalOpen } = useCalendar();

    const months = useMemo(() => {
        if (!view) {
            return [];
        }

        return Array.from({ length: 12 }).map((_, i) => {
            return getDaysInMonth(setMonth(date, i));
        });
    }, [date, view]);

    const weekDays = useMemo(() => generateWeekdays(locale), [locale]);

    if (view !== 'year') return null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-10 overflow-auto h-full p-2 md:p-4">
            {months.map((days, i) => (
                <div key={days[0].toString()}>
                    <span className="flex justify-center text-lg md:text-xl font-medium">{format(setMonth(new Date(), i), 'MMMM', { locale })}</span>

                    <div className="grid grid-cols-7 gap-1 md:gap-2 my-3 md:my-5">
                        {weekDays.map((day) => (
                            <div
                                key={day}
                                className="text-center text-[10px] md:text-xs text-muted-foreground truncate"
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid gap-x-1 md:gap-x-2 text-center grid-cols-7 text-xs tabular-nums">
                        {days.map((_date) => {
                            return (
                                <div
                                    key={_date.toString()}
                                    className={cn(
                                        getMonth(_date) !== i && 'text-muted-foreground'
                                    )}
                                >
                                    <div
                                        onClick={() => setDate(_date)}
                                        onDoubleClick={() => {
                                            setSelectedDateForEvent(_date);
                                            setIsEventModalOpen(true);
                                        }}
                                        className={cn(
                                            'aspect-square grid place-content-center size-full tabular-nums cursor-pointer hover:bg-muted rounded-full transition-colors',
                                            isSameDay(date, _date) && getMonth(_date) === i && 'bg-primary/30 text-primary font-medium',
                                            isSameDay(today, _date) &&
                                            getMonth(_date) === i &&
                                            'bg-primary text-primary-foreground font-normal'
                                        )}
                                    >
                                        {format(_date, 'd')}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

const CalendarNextTrigger = forwardRef<
    HTMLButtonElement,
    React.HTMLAttributes<HTMLButtonElement>
>(({ children, onClick, ...props }, ref) => {
    const { date, setDate, view, enableHotkeys } = useCalendar();

    const next = useCallback(() => {
        if (view === 'day') {
            setDate(addDays(date, 1));
        } else if (view === 'week') {
            setDate(addWeeks(date, 1));
        } else if (view === 'month') {
            setDate(addMonths(date, 1));
        } else if (view === 'year') {
            setDate(addYears(date, 1));
        }
    }, [date, view, setDate]);

    useHotkeys('ArrowRight', () => next(), {
        enabled: enableHotkeys,
    });

    return (
        <Button
            size="icon"
            variant="outline"
            ref={ref}
            {...props}
            onClick={(e) => {
                next();
                onClick?.(e);
            }}
        >
            {children}
        </Button>
    );
});
CalendarNextTrigger.displayName = 'CalendarNextTrigger';

const CalendarPrevTrigger = forwardRef<
    HTMLButtonElement,
    React.HTMLAttributes<HTMLButtonElement>
>(({ children, onClick, ...props }, ref) => {
    const { date, setDate, view, enableHotkeys } = useCalendar();

    useHotkeys('ArrowLeft', () => prev(), {
        enabled: enableHotkeys,
    });

    const prev = useCallback(() => {
        if (view === 'day') {
            setDate(subDays(date, 1));
        } else if (view === 'week') {
            setDate(subWeeks(date, 1));
        } else if (view === 'month') {
            setDate(subMonths(date, 1));
        } else if (view === 'year') {
            setDate(subYears(date, 1));
        }
    }, [date, view, setDate]);

    return (
        <Button
            size="icon"
            variant="outline"
            ref={ref}
            {...props}
            onClick={(e) => {
                prev();
                onClick?.(e);
            }}
        >
            {children}
        </Button>
    );
});
CalendarPrevTrigger.displayName = 'CalendarPrevTrigger';

const CalendarTodayTrigger = forwardRef<
    HTMLButtonElement,
    React.HTMLAttributes<HTMLButtonElement>
>(({ children, onClick, ...props }, ref) => {
    const { setDate, enableHotkeys, today } = useCalendar();

    useHotkeys('t', () => jumpToToday(), {
        enabled: enableHotkeys,
    });

    const jumpToToday = useCallback(() => {
        setDate(today);
    }, [today, setDate]);

    return (
        <Button
            variant="outline"
            ref={ref}
            {...props}
            onClick={(e) => {
                jumpToToday();
                onClick?.(e);
            }}
        >
            {children}
        </Button>
    );
});
CalendarTodayTrigger.displayName = 'CalendarTodayTrigger';

const CalendarCurrentDate = () => {
    const { date, view, setDate } = useCalendar();

    const currentYear = date.getFullYear();
    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setDate(setYear(date, parseInt(e.target.value)));
    };

    const years = Array.from({ length: 100 }, (_, i) => currentYear - 50 + i);

    return (
        <time dateTime={date.toISOString()} className="tabular-nums flex items-center gap-2 group">
            <span>{format(date, view === 'day' ? 'dd MMMM' : 'MMMM')}</span>
            <div className="relative flex items-center rounded-lg border border-border/80 bg-black/5 dark:bg-black/20 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_6px_rgba(0,0,0,0.4)] px-3 py-1">
                <select
                    value={currentYear}
                    onChange={handleYearChange}
                    className="bg-transparent appearance-none cursor-pointer outline-none font-bold pr-5 z-10"
                >
                    {years.map((y) => (
                        <option key={y} value={y} className="text-white dark:text-black bg-black/50 dark:bg-black/50 font-medium scrollbar-thin dark:scrollbar-thin">
                            {y}
                        </option>
                    ))}
                </select>
                <ChevronsUpDown className="w-4 h-4 text-muted-foreground absolute right-2 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
        </time>
    );
};

const TimeTable = () => {
    const now = new Date();

    return (
        <div className="pr-2 w-12">
            {Array.from(Array(25).keys()).map((hour) => {
                return (
                    <div
                        className="text-right relative text-xs text-muted-foreground/50 h-20 last:h-0"
                        key={hour}
                    >
                        {now.getHours() === hour && (
                            <div
                                className="absolute z-10 left-full translate-x-2 w-dvw h-[2px] bg-red-500"
                                style={{
                                    top: `${(now.getMinutes() / 60) * 100}%`,
                                }}
                            >
                                <div className="size-2 rounded-full bg-red-500 absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                            </div>
                        )}
                        <p className="top-0 -translate-y-1/2">
                            {hour === 24 ? 0 : hour}:00
                        </p>
                    </div>
                );
            })}
        </div>
    );
};

const getDaysInMonth = (date: Date) => {
    const startOfMonthDate = startOfMonth(date);
    const startOfWeekForMonth = startOfWeek(startOfMonthDate, {
        weekStartsOn: 0,
    });

    let currentDate = startOfWeekForMonth;
    const calendar = [];

    while (calendar.length < 42) {
        calendar.push(new Date(currentDate));
        currentDate = addDays(currentDate, 1);
    }

    return calendar;
};

const generateWeekdays = (locale: Locale) => {
    const daysOfWeek = [];
    for (let i = 0; i < 7; i++) {
        const date = addDays(startOfWeek(new Date(), { weekStartsOn: 0 }), i);
        daysOfWeek.push(format(date, 'EEEEEE', { locale }));
    }
    return daysOfWeek;
};

export {
    Calendar,
    CalendarCurrentDate,
    CalendarDayView,
    CalendarMonthView,
    CalendarNextTrigger,
    CalendarPrevTrigger,
    CalendarTodayTrigger,
    CalendarViewTrigger,
    CalendarWeekView,
    CalendarYearView,
};

const EventModal = () => {
    const { isEventModalOpen, setIsEventModalOpen, selectedDateForEvent, events, setEvents } = useCalendar();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        tags: '',
        creator: '',
        color: 'default' as CalendarEvent['color'],
    });

    if (!isEventModalOpen || !selectedDateForEvent) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newEvent: CalendarEvent = {
            id: Math.random().toString(36).substring(7),
            start: selectedDateForEvent,
            end: selectedDateForEvent,
            title: formData.title || 'New Event',
            description: formData.description,
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
            creator: formData.creator,
            color: formData.color,
        };

        setEvents([...events, newEvent]);

        // Reset and close
        setFormData({ title: '', description: '', tags: '', creator: '', color: 'default' });
        setIsEventModalOpen(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={() => setIsEventModalOpen(false)}
            />
            <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-primary/10 to-primary/5 pointer-events-none" />

                <div className="relative px-6 md:px-8 pt-6 md:pt-8 pb-4 flex justify-between items-start">
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Add Event</h2>
                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {format(selectedDateForEvent, 'MMMM d, yyyy')}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="px-6 md:px-8 pb-8 pt-2 space-y-4 md:space-y-5">
                    <div className="space-y-1">
                        <label htmlFor="title" className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Title</label>
                        <input
                            id="title"
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium text-gray-700 dark:text-gray-200"
                            placeholder="Event Title"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="description" className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium text-gray-700 dark:text-gray-200 resize-none"
                            placeholder="Add details..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label htmlFor="tags" className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Tags</label>
                            <input
                                id="tags"
                                type="text"
                                name="tags"
                                value={formData.tags}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium text-gray-700 dark:text-gray-200"
                                placeholder="work, remote"
                            />
                        </div>
                        <div className="space-y-1">
                            <label htmlFor="creator" className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Creator</label>
                            <input
                                id="creator"
                                type="text"
                                name="creator"
                                value={formData.creator}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium text-gray-700 dark:text-gray-200"
                                placeholder="John Doe"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="color" className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Color</label>
                        <select
                            id="color"
                            name="color"
                            value={formData.color || 'default'}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium text-gray-700 dark:text-gray-200 cursor-pointer"
                        >
                            <option className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value="default">Default</option>
                            <option className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value="blue">Blue</option>
                            <option className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value="green">Green</option>
                            <option className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value="pink">Pink</option>
                            <option className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value="purple">Purple</option>
                        </select>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsEventModalOpen(false)}
                            className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-primary text-primary-foreground font-bold py-2.5 rounded-xl shadow-lg hover:opacity-90 transition-all font-medium"
                        >
                            Create Event
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default function CalendarApp() {
    return (
        <div className="h-full w-full bg-background/50 backdrop-blur-sm p-3 md:p-6">
            <Calendar>
                <div className="h-full flex flex-col space-y-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <CalendarViewTrigger className='cursor-pointer' view="day">Day</CalendarViewTrigger>
                            <CalendarViewTrigger className='cursor-pointer' view="week">Week</CalendarViewTrigger>
                            <CalendarViewTrigger className='cursor-pointer' view="month">Month</CalendarViewTrigger>
                            <CalendarViewTrigger className='cursor-pointer' view="year">Year</CalendarViewTrigger>
                        </div>

                        <div className="flex items-center gap-4 text-lg md:text-xl font-bold order-first md:order-none w-full md:w-auto justify-center md:justify-start">
                            <CalendarCurrentDate />
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
                            <CalendarPrevTrigger className="cursor-pointer">
                                <FiChevronLeft />
                            </CalendarPrevTrigger>
                            <CalendarTodayTrigger className="cursor-pointer">Today</CalendarTodayTrigger>
                            <CalendarNextTrigger className="cursor-pointer">
                                <FiChevronRight />
                            </CalendarNextTrigger>
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
            </Calendar>
        </div>
    );
}
