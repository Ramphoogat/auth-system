import { cn } from '../../lib/utils';
import {
    addDays,
    differenceInMinutes,
    format,
    getMonth,
    isBefore,
    isSameDay,
    isSameHour,
    isSameMonth,
    isToday,
    setHours,
    setMonth,
    startOfWeek,
} from 'date-fns';

import { useEffect, useMemo, useState } from 'react';
import {
    dayEventVariants,
    monthEventVariants,
    useCalendar,
    type CalendarEvent,
} from './calendar-context';
import { createPortal } from 'react-dom';
import {
    getDaysInMonth,
    generateWeekdays,
    getRangeStyle,
    useRangeHelpers,
} from './calendar-utils';


// ─── Date Range Context Menu ──────────────────────────────────────────────────

type ContextMenuState = { x: number; y: number; date: Date } | null;

export const DateRangeContextMenu = ({
    menu,
    onClose,
}: {
    menu: ContextMenuState;
    onClose: () => void;
}) => {
    const { draftStart, setDraftStart, addRange, ranges } = useCalendar();

    useEffect(() => {
        if (!menu) return;
        const close = () => onClose();
        window.addEventListener('click', close);
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
        window.addEventListener('keydown', onKey);
        return () => {
            window.removeEventListener('click', close);
            window.removeEventListener('keydown', onKey);
        };
    }, [menu, onClose]);

    if (!menu) return null;

    const canSetEnd = !!draftStart;

    const handleSetStart = (e: React.MouseEvent) => {
        e.stopPropagation();
        setDraftStart(menu.date);
        onClose();
    };

    const handleSetEnd = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!draftStart) return;
        const start = isBefore(draftStart, menu.date) ? draftStart : menu.date;
        const end = isBefore(draftStart, menu.date) ? menu.date : draftStart;
        addRange({ id: Math.random().toString(36).substring(7), start, end });
        setDraftStart(null);
        onClose();
    };

    const handleCancelDraft = (e: React.MouseEvent) => {
        e.stopPropagation();
        setDraftStart(null);
        onClose();
    };

    return createPortal(
        <div
            className="fixed z-[9999] min-w-[196px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-border overflow-hidden"
            style={{ top: menu.y, left: menu.x }}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="px-3 py-2 border-b border-border bg-muted/40 flex items-center justify-between gap-2">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    {format(menu.date, 'MMM d, yyyy')}
                </p>
                {ranges.length > 0 && (
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-semibold">
                        {ranges.length} range{ranges.length > 1 ? 's' : ''}
                    </span>
                )}
            </div>

            {draftStart && (
                <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-200 dark:border-emerald-700/40 flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                        Start: <span className="tabular-nums font-bold">{format(draftStart, 'MMM d')}</span> — pick end date
                    </p>
                </div>
            )}

            <div className="p-1 flex flex-col gap-0.5">
                <button
                    onClick={handleSetStart}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors text-left"
                >
                    <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
                    {draftStart ? 'Change Start Date' : 'Set as Start Date'}
                </button>

                <button
                    onClick={handleSetEnd}
                    disabled={!canSetEnd}
                    className={cn(
                        'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left',
                        canSetEnd
                            ? 'hover:bg-primary/10 hover:text-primary'
                            : 'opacity-40 cursor-not-allowed text-muted-foreground'
                    )}
                >
                    <span className="size-2 rounded-full bg-rose-500 shrink-0" />
                    Set as End Date
                    {!canSetEnd && <span className="ml-auto text-[10px] text-muted-foreground/60">set start first</span>}
                </button>

                {draftStart && (
                    <>
                        <div className="h-px bg-border my-0.5 mx-2" />
                        <button
                            onClick={handleCancelDraft}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors text-left text-muted-foreground"
                        >
                            <span className="text-xs">✕</span>
                            Cancel Selection
                        </button>
                    </>
                )}
            </div>
        </div>,
        document.body
    );
};

// ─── TimeTable ────────────────────────────────────────────────────────────────

export const TimeTable = () => {
    const now = new Date();
    return (
        <div className="pr-2 w-12">
            {Array.from(Array(25).keys()).map((hour) => (
                <div className="text-right relative text-xs text-muted-foreground/50 h-20 last:h-0" key={hour}>
                    {now.getHours() === hour && (
                        <div
                            className="absolute z-10 left-full translate-x-2 w-dvw h-[2px] bg-red-500"
                            style={{ top: `${(now.getMinutes() / 60) * 100}%` }}
                        >
                            <div className="size-2 rounded-full bg-red-500 absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </div>
                    )}
                    <p className="top-0 -translate-y-1/2">{hour === 24 ? 0 : hour}:00</p>
                </div>
            ))}
        </div>
    );
};

// ─── EventGroup ───────────────────────────────────────────────────────────────

export const EventGroup = ({ events, hour }: { events: CalendarEvent[]; hour: Date }) => (
    <div className="h-20 border-t last:border-b">
        {events
            .filter((event) => isSameHour(event.start, hour))
            .map((event) => {
                const hoursDifference = differenceInMinutes(event.end, event.start) / 60;
                const startPosition = event.start.getMinutes() / 60;
                return (
                    <div
                        key={event.id}
                        className={cn('relative', dayEventVariants({ variant: event.color }))}
                        style={{ top: `${startPosition * 100}%`, height: `${hoursDifference * 100}%` }}
                    >
                        {event.title}
                    </div>
                );
            })}
    </div>
);

// ─── Day View ─────────────────────────────────────────────────────────────────

export const CalendarDayView = () => {
    const { view, events, date } = useCalendar();
    if (view !== 'day') return null;
    const hours = [...Array(24)].map((_, i) => setHours(date, i));
    return (
        <div className="flex relative pt-2 overflow-auto h-full" onContextMenu={(e) => e.preventDefault()}>
            <TimeTable />
            <div className="flex-1">
                {hours.map((hour) => <EventGroup key={hour.toString()} hour={hour} events={events} />)}
            </div>
        </div>
    );
};

// ─── Week View ────────────────────────────────────────────────────────────────

export const CalendarWeekView = () => {
    const { view, date, locale, events } = useCalendar();

    const weekDates = useMemo(() => {
        const start = startOfWeek(date, { weekStartsOn: 0 });
        return Array.from({ length: 7 }, (_, i) => {
            const day = addDays(start, i);
            return [...Array(24)].map((__, h) => setHours(day, h));
        });
    }, [date]);

    const headerDays = useMemo(() => (
        Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(date, { weekStartsOn: 0 }), i))
    ), [date]);

    if (view !== 'week') return null;

    return (
        <div className="flex flex-col relative overflow-auto h-full" onContextMenu={(e) => e.preventDefault()}>
            <div className="flex sticky top-0 bg-card z-10 border-b mb-3">
                <div className="w-12" />
                {headerDays.map((d, i) => (
                    <div
                        key={d.toString()}
                        className={cn(
                            'text-center flex-1 gap-1 pb-2 text-sm text-muted-foreground flex items-center justify-center',
                            [0, 6].includes(i) && 'text-muted-foreground/50'
                        )}
                    >
                        {format(d, 'E', { locale })}
                        <span className={cn('h-6 grid place-content-center', isToday(d) && 'bg-primary text-primary-foreground rounded-full size-6')}>
                            {format(d, 'd')}
                        </span>
                    </div>
                ))}
            </div>
            <div className="flex flex-1">
                <div className="w-fit"><TimeTable /></div>
                <div className="grid grid-cols-7 flex-1">
                    {weekDates.map((hours, i) => (
                        <div
                            key={hours[0].toString()}
                            className={cn('h-full text-sm text-muted-foreground border-l first:border-l-0', [0, 6].includes(i) && 'bg-muted/50')}
                        >
                            {hours.map((hour) => <EventGroup key={hour.toString()} hour={hour} events={events} />)}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ─── Month View ───────────────────────────────────────────────────────────────

export const CalendarMonthView = () => {
    const { date, setDate, today, view, events, locale, setSelectedDateForEvent, setIsEventModalOpen, deleteEvent, setSelectedEventForEdit } = useCalendar();
    const { getRangeInfo, isDraftStart } = useRangeHelpers();

    const monthDates = useMemo(() => getDaysInMonth(date), [date]);
    const weekDays = useMemo(() => generateWeekdays(locale), [locale]);
    const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);

    if (view !== 'month') return null;

    const handleContextMenu = (e: React.MouseEvent, d: Date) => {
        e.preventDefault();
        e.stopPropagation();
        const menuW = 210, menuH = 230;
        let x = e.clientX + 6, y = e.clientY + 6;
        if (x + menuW > window.innerWidth) x = e.clientX - menuW - 6;
        if (y + menuH > window.innerHeight) y = e.clientY - menuH - 6;
        setContextMenu({ x, y, date: d });
    };

    return (
        <div className="h-full flex flex-col">
            <DateRangeContextMenu menu={contextMenu} onClose={() => setContextMenu(null)} />

            <div className="grid grid-cols-7 gap-px sticky top-0 bg-background border-b">
                {weekDays.map((day, i) => (
                    <div key={day} className={cn('mb-2 text-center text-sm text-muted-foreground pr-2', [0, 6].includes(i) && 'text-muted-foreground/50')}>
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid overflow-hidden -mt-px flex-1 auto-rows-fr p-px grid-cols-7 gap-px">
                {monthDates.map((_date) => {
                    const currentEvents = events.filter((ev) => isSameDay(ev.start, _date));
                    const { inRange, isStart, isEnd, isSingleDay, colorIndex } = getRangeInfo(_date);
                    const style = inRange ? getRangeStyle(colorIndex) : null;
                    const draft = isDraftStart(_date);

                    return (
                        <div
                            key={_date.toString()}
                            onClick={() => setDate(_date)}
                            onDoubleClick={() => { setSelectedDateForEvent(_date); setIsEventModalOpen(true); }}
                            onContextMenu={(e) => handleContextMenu(e, _date)}
                            className={cn(
                                'ring-1 p-2 text-sm text-muted-foreground ring-border overflow-auto cursor-pointer transition-colors relative select-none',
                                !isSameMonth(date, _date) && 'text-muted-foreground/50',
                                isSameDay(date, _date) && !inRange && 'bg-muted/10',
                                !inRange && 'hover:bg-muted/50',
                            )}
                            style={inRange && style ? { backgroundColor: style.bg } : undefined}
                        >
                            <span
                                className="size-6 grid place-items-center rounded-full mb-1 sticky top-0 transition-colors font-medium"
                                style={
                                    (isStart || isEnd || (isSingleDay && isStart)) && style
                                        ? { backgroundColor: style.capBg, color: 'white', boxShadow: `0 0 0 2px ${style.capRing}` }
                                        : draft
                                            ? { backgroundColor: 'hsl(142,68%,48%)', color: 'white', boxShadow: '0 0 0 2px hsla(142,80%,55%,0.4)' }
                                            : undefined
                                }
                            >
                                <span className={cn(
                                    'size-6 grid place-items-center rounded-full',
                                    !isStart && !isEnd && !draft && isSameDay(today, _date) && 'bg-primary text-primary-foreground',
                                    !isStart && !isEnd && !draft && isSameDay(date, _date) && !isSameDay(today, _date) && 'bg-primary/30 text-primary',
                                )}>
                                    {format(_date, 'd')}
                                </span>
                            </span>

                            {currentEvents.map((event) => (
                                <div key={event.id} className="px-1 rounded text-sm flex items-center gap-1 group/ev">
                                    <div className={cn('shrink-0', monthEventVariants({ variant: event.color }))} />
                                    <span className="flex-1 truncate">{event.title}</span>
                                    <time className="tabular-nums text-muted-foreground/50 text-xs">{format(event.start, 'HH:mm')}</time>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedDateForEvent(event.start);
                                            setSelectedEventForEdit(event);
                                            setIsEventModalOpen(true);
                                        }}
                                        className="ml-auto opacity-0 group-hover/ev:opacity-100 transition-opacity text-muted-foreground/60 hover:text-blue-500 text-xs leading-none rounded-full size-4 flex items-center justify-center hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                        title="Edit event"
                                    >✏️</button>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); deleteEvent(event.id); }}
                                        className="ml-0.5 opacity-0 group-hover/ev:opacity-100 transition-opacity text-muted-foreground/60 hover:text-red-500 text-xs leading-none rounded-full size-4 flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/30"
                                        title="Delete event"
                                    >✕</button>
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ─── Year View ────────────────────────────────────────────────────────────────

export const CalendarYearView = () => {
    const { view, date, today, locale, setDate, setSelectedDateForEvent, setIsEventModalOpen } = useCalendar();
    const { getRangeInfo, isDraftStart } = useRangeHelpers();

    const months = useMemo(() => {
        if (!view) return [];
        return Array.from({ length: 12 }, (_, i) => getDaysInMonth(setMonth(date, i)));
    }, [date, view]);

    const weekDays = useMemo(() => generateWeekdays(locale), [locale]);
    const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);

    if (view !== 'year') return null;

    const handleContextMenu = (e: React.MouseEvent, d: Date) => {
        e.preventDefault();
        e.stopPropagation();
        const menuW = 210, menuH = 230;
        let x = e.clientX + 6, y = e.clientY + 6;
        if (x + menuW > window.innerWidth) x = e.clientX - menuW - 6;
        if (y + menuH > window.innerHeight) y = e.clientY - menuH - 6;
        setContextMenu({ x, y, date: d });
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-10 overflow-auto h-full p-2 md:p-4">
            <DateRangeContextMenu menu={contextMenu} onClose={() => setContextMenu(null)} />

            {months.map((days, i) => (
                <div key={days[0].toString()}>
                    <span className="flex justify-center text-lg md:text-xl font-medium">
                        {format(setMonth(new Date(), i), 'MMMM', { locale })}
                    </span>

                    <div className="grid grid-cols-7 gap-1 md:gap-2 my-3 md:my-5">
                        {weekDays.map((day) => (
                            <div key={day} className="text-center text-[10px] md:text-xs text-muted-foreground truncate">{day}</div>
                        ))}
                    </div>

                    <div className="grid gap-x-1 md:gap-x-2 text-center grid-cols-7 text-xs tabular-nums">
                        {days.map((_date) => {
                            const belongsHere = getMonth(_date) === i;
                            const { inRange, isStart, isEnd, colorIndex } = getRangeInfo(_date);
                            const inRangeHere = inRange && belongsHere;
                            const style = inRangeHere ? getRangeStyle(colorIndex) : null;
                            const draft = isDraftStart(_date) && belongsHere;
                            const isCap = (isStart || isEnd) && belongsHere;

                            return (
                                <div
                                    key={_date.toString()}
                                    onContextMenu={(e) => handleContextMenu(e, _date)}
                                    style={inRangeHere && style ? { backgroundColor: style.bg } : undefined}
                                    className={cn(!belongsHere && 'opacity-30')}
                                >
                                    <div
                                        onClick={() => setDate(_date)}
                                        onDoubleClick={() => { setSelectedDateForEvent(_date); setIsEventModalOpen(true); }}
                                        className={cn(
                                            'aspect-square grid place-content-center size-full tabular-nums cursor-pointer rounded-full transition-colors select-none',
                                            !isCap && !draft && 'hover:bg-muted',
                                            !isCap && !draft && isSameDay(date, _date) && belongsHere && 'bg-primary/30 text-primary font-medium',
                                            !isCap && !draft && isSameDay(today, _date) && belongsHere && 'bg-primary text-primary-foreground font-normal',
                                        )}
                                        style={
                                            isCap && style
                                                ? { backgroundColor: style.capBg, color: 'white' }
                                                : draft
                                                    ? { backgroundColor: 'hsl(142,68%,48%)', color: 'white' }
                                                    : undefined
                                        }
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
