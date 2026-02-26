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
    startOfDay,
    startOfWeek,
} from 'date-fns';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    dayEventVariants,
    monthEventVariants,
    useCalendar,
    type CalendarEvent,
    type DateRange,
} from './calendar-context';
import { createPortal } from 'react-dom';
import { useToast } from '../ToastProvider';
import {
    getDaysInMonth,
    generateWeekdays,
    getRangeStyle,
    useRangeHelpers,
    type RangeMatch,
} from './calendar-utils';



// ─── Date Hover Tooltip ───────────────────────────────────────────────────────

type HoverState = {
    x: number;
    y: number;
    date: Date;
    events: CalendarEvent[];
    rangeMatches: RangeMatch[];
} | null;

const DateHoverTooltip = ({ hover, ranges, isLocked }: { hover: HoverState; ranges: DateRange[]; isLocked?: boolean }) => {
    if (!hover) return null;

    const { events, rangeMatches } = hover;
    const hasContent = events.length > 0 || rangeMatches.length > 0;

    // Position tooltip — flip if near edges
    const tooltipW = 260, tooltipH = 200;
    let x = hover.x + 12, y = hover.y + 12;
    if (x + tooltipW > window.innerWidth) x = hover.x - tooltipW - 12;
    if (y + tooltipH > window.innerHeight) y = hover.y - tooltipH - 12;
    if (x < 4) x = 4;
    if (y < 4) y = 4;

    return createPortal(
        <div
            className={cn(
                "fixed z-[9999] w-[260px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200",
                isLocked ? "pointer-events-auto" : "pointer-events-none"
            )}
            style={{ top: y, left: x }}
        >
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-blue-500/5 to-transparent dark:from-blue-500/10" />
            {/* Header */}
            <div className="px-3 py-2 border-b border-border bg-muted/40 shrink-0 flex items-center justify-between gap-4">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="text-xs font-black text-foreground">
                            {format(hover.date, 'EEEE, MMM d, yyyy')}
                        </p>
                        {isLocked && (
                            <span className="text-[8px] font-black uppercase tracking-widest bg-emerald-500 text-white px-1.5 py-0.5 rounded-sm shadow-sm animate-pulse">
                                Pinned
                            </span>
                        )}
                    </div>
                    {hasContent && (
                        <p className="text-[10px] text-muted-foreground mt-0.5 font-bold uppercase tracking-tighter opacity-70">
                            {rangeMatches.length > 0 && `${rangeMatches.length} range${rangeMatches.length > 1 ? 's' : ''}`}
                            {rangeMatches.length > 0 && events.length > 0 && ' · '}
                            {events.length > 0 && `${events.length} event${events.length > 1 ? 's' : ''}`}
                        </p>
                    )}
                </div>

                {isLocked && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            window.dispatchEvent(new CustomEvent('closeCalendarTooltip'));
                        }}
                        className="size-5 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] hover:bg-red-500 hover:text-white transition-all shadow-inner border border-border/50"
                    >
                        ✕
                    </button>
                )}
            </div>

            <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/10 hover:scrollbar-thumb-primary/20">
                {rangeMatches.length > 0 && (
                    <div className="px-3 py-2 space-y-2">
                        {rangeMatches.map((m) => {
                            const range = ranges[m.rangeIndex];
                            if (!range) return null;
                            const style = getRangeStyle(m.colorIndex ?? m.rangeIndex);
                            const displayName = range.label || `Range #${m.rangeIndex + 1}`;
                            const days = Math.round((startOfDay(range.end).getTime() - startOfDay(range.start).getTime()) / 86400000) + 1;
                            return (
                                <div key={range.id} className="flex items-start gap-2.5">
                                    <div
                                        className="shrink-0 size-2.5 rounded-full mt-1 border-2 border-white dark:border-gray-800 shadow-sm"
                                        style={{ backgroundColor: style.capBg }}
                                    />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-2">
                                            {isLocked ? (
                                                <input
                                                    type="text"
                                                    defaultValue={range.label || ""}
                                                    placeholder={`Range #${m.rangeIndex + 1}`}
                                                    className="bg-transparent border-none p-0 m-0 outline-none text-[11px] font-black w-full focus:ring-1 focus:ring-primary/20 rounded px-0.5"
                                                    style={{ color: style.label }}
                                                    onBlur={(e) => {
                                                        const newVal = e.target.value.trim();
                                                        if (newVal !== (range.label || "")) {
                                                            window.calendar_helpers?.renameRange?.(range.id, newVal);
                                                        }
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') e.currentTarget.blur();
                                                    }}
                                                />
                                            ) : (
                                                <p className="text-[11px] font-black truncate" style={{ color: style.label }}>{displayName}</p>
                                            )}
                                            <span className="text-[9px] font-black text-emerald-500 tabular-nums shrink-0">
                                                {days} days
                                            </span>
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-400 tabular-nums">
                                            {format(range.start, 'MMM d')} → {format(range.end, 'MMM d')}
                                        </p>
                                        <div className="flex flex-col gap-1 mt-1">
                                            {isLocked ? (
                                                <textarea
                                                    defaultValue={range.description || ""}
                                                    placeholder="Add description..."
                                                    className="bg-transparent border-none p-1 m-0 outline-none text-[10px] text-gray-500 dark:text-gray-400 font-medium leading-tight w-full resize-none min-h-[1.5rem] hover:bg-gray-50 dark:hover:bg-gray-800/50 focus:bg-gray-50 dark:focus:bg-gray-800/50 rounded transition-all"
                                                    onBlur={(e) => {
                                                        const newVal = e.target.value.trim();
                                                        if (newVal !== (range.description || "")) {
                                                            window.calendar_helpers?.updateRangeDescription?.(range.id, newVal);
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                range.description && (
                                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium leading-tight">{range.description}</p>
                                                )
                                            )}
                                            {range.createdAt && !isNaN(new Date(range.createdAt).getTime()) && (
                                                <div className="flex items-center gap-1.5 opacity-40 mt-0.5">
                                                    <span className="text-[8px] font-black text-gray-400">CREATED {format(new Date(range.createdAt), 'MMM d')}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Divider */}
                {rangeMatches.length > 0 && events.length > 0 && (
                    <div className="h-px bg-border mx-3" />
                )}

                {/* Events */}
                {events.length > 0 && (
                    <div className="px-3 py-2 space-y-2">
                        {events.map((event) => (
                            <div key={event.id} className="flex items-start gap-2.5 group/event">
                                <div className={cn('shrink-0 size-2.5 rounded-full mt-1 border-2 border-white dark:border-gray-800 shadow-sm', monthEventVariants({ variant: event.color }))} />
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                        {isLocked ? (
                                            <input
                                                type="text"
                                                defaultValue={event.title}
                                                placeholder="Event Title"
                                                className="bg-transparent border-none p-0 m-0 outline-none text-[11px] font-black text-gray-900 dark:text-white w-full focus:ring-1 focus:ring-primary/20 rounded px-0.5"
                                                onBlur={(e) => {
                                                    const newVal = e.target.value.trim();
                                                    if (newVal && newVal !== event.title) {
                                                        window.calendar_helpers?.updateEventTitle?.(event.id, newVal);
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') e.currentTarget.blur();
                                                }}
                                            />
                                        ) : (
                                            <p className="text-[11px] font-black text-gray-900 dark:text-white truncate">{event.title}</p>
                                        )}
                                        <span className="text-[9px] font-bold text-gray-400 tabular-nums shrink-0 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-md">
                                            {format(event.start, 'hh:mm a')}
                                        </span>
                                    </div>

                                    {isLocked ? (
                                        <textarea
                                            defaultValue={event.description || ""}
                                            placeholder="Add description..."
                                            className="bg-transparent border-none p-1 m-0 outline-none text-[10px] text-gray-500 dark:text-gray-400 font-medium leading-tight w-full resize-none min-h-[1.5rem] mt-0.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 focus:bg-gray-50 dark:focus:bg-gray-800/50 rounded transition-all"
                                            onBlur={(e) => {
                                                const newVal = e.target.value.trim();
                                                if (newVal !== (event.description || "")) {
                                                    window.calendar_helpers?.updateEventDescription?.(event.id, newVal);
                                                }
                                            }}
                                        />
                                    ) : (
                                        event.description && (
                                            <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5 leading-relaxed font-medium">
                                                {event.description}
                                            </p>
                                        )
                                    )}

                                    {event.tags && event.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1.5">
                                            {event.tags.map((tag, idx) => (
                                                <span key={idx} className="text-[8px] font-black uppercase tracking-tighter bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-sm border border-blue-500/20">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {event.creator && (
                                        <div className="flex items-center gap-1 mt-1 opacity-60">
                                            <div className="size-3 rounded-full bg-blue-500/20 flex items-center justify-center">
                                                <span className="text-[7px] text-blue-500 font-black">{event.creator[0]?.toUpperCase()}</span>
                                            </div>
                                            <span className="text-[9px] font-bold text-gray-400">{event.creator}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Mobile Actions (Visible when locked/clicked) */}
            {isLocked && (
                <div className="px-2 py-2 border-t border-border bg-gray-50/50 dark:bg-gray-900/50 flex gap-1.5 shrink-0">
                    <TooltipAction
                        onClick={(e) => {
                            e.stopPropagation();
                            const { setSelectedDateForEvent, setIsEventModalOpen } = window.calendar_helpers;
                            setSelectedDateForEvent(hover.date);
                            setIsEventModalOpen(true);
                        }}
                        icon="✨"
                        label="New Event"
                        color="blue"
                    />
                    <TooltipAction
                        onClick={(e) => {
                            e.stopPropagation();
                            const { draftStart, setDraftStart, addRange } = window.calendar_helpers;
                            if (draftStart) {
                                const start = isBefore(draftStart, hover.date) ? draftStart : hover.date;
                                const end = isBefore(draftStart, hover.date) ? hover.date : draftStart;
                                addRange({ id: Math.random().toString(36).substring(7), start, end, createdAt: new Date() });
                                setDraftStart(null);
                            } else {
                                setDraftStart(hover.date);
                            }
                        }}
                        icon="📏"
                        label={window.calendar_helpers?.draftStart ? "Set End" : "Set Range"}
                        color="emerald"
                    />
                </div>
            )}
        </div>,
        document.body
    );
};

const TooltipAction = ({ onClick, icon, label, color }: { onClick: (e: React.MouseEvent) => void; icon: string; label: string; color: 'blue' | 'emerald' }) => (
    <button
        onClick={onClick}
        className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border",
            color === 'blue'
                ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20 hover:bg-blue-700"
                : "bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-500/20 hover:bg-emerald-700"
        )}
    >
        <span>{icon}</span>
        {label}
    </button>
);

// Hook to manage hover state with delay
const useDateHover = (events: CalendarEvent[]) => {
    const [hover, setHover] = useState<HoverState>(null);
    const [lockedDate, setLockedDate] = useState<Date | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const handleClose = () => {
            setLockedDate(null);
            setHover(null);
        };
        window.addEventListener('closeCalendarTooltip', handleClose);
        return () => window.removeEventListener('closeCalendarTooltip', handleClose);
    }, []);

    const getHoverData = useCallback((_date: Date, rangeMatches: RangeMatch[]) => {
        const dateEvents = events.filter((ev) => isSameDay(ev.start, _date));
        return {
            date: _date,
            events: dateEvents,
            rangeMatches,
        };
    }, [events]);

    const handleEventMouseEnter = useCallback((e: React.MouseEvent, event: CalendarEvent) => {
        if (lockedDate) return;
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            setHover({
                x: e.clientX,
                y: e.clientY,
                date: event.start,
                events: [event],
                rangeMatches: [],
            });
        }, 200); // Slightly faster for direct items
    }, [lockedDate]);

    const handleRangeMouseEnter = useCallback((e: React.MouseEvent, range: DateRange, rangeIndex: number) => {
        if (lockedDate) return;
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            setHover({
                x: e.clientX,
                y: e.clientY,
                date: range.start,
                events: [],
                rangeMatches: [{
                    rangeIndex,
                    isStart: true,
                    isEnd: true,
                    colorIndex: range.colorIndex ?? rangeIndex,
                    isSingleDay: isSameDay(range.start, range.end),
                    isFirstInWeek: false
                }],
            });
        }, 200);
    }, [lockedDate]);

    const handleMouseEnter = useCallback((e: React.MouseEvent, _date: Date, rangeMatches: RangeMatch[]) => {
        if (lockedDate) return;

        const data = getHoverData(_date, rangeMatches);

        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            setHover({
                x: e.clientX,
                y: e.clientY,
                ...data
            });
        }, 350);
    }, [lockedDate, getHoverData]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (lockedDate) return;
        setHover((prev) => prev ? { ...prev, x: e.clientX, y: e.clientY } : prev);
    }, [lockedDate]);

    const handleMouseLeave = useCallback(() => {
        if (lockedDate) return;
        if (timerRef.current) clearTimeout(timerRef.current);
        setHover(null);
    }, [lockedDate]);

    const toggleLock = useCallback((e: React.MouseEvent, _date: Date, rangeMatches: RangeMatch[]) => {
        e.stopPropagation();
        if (lockedDate && isSameDay(lockedDate, _date)) {
            setLockedDate(null);
            setHover(null);
        } else {
            setLockedDate(_date);
            const data = getHoverData(_date, rangeMatches);
            setHover({
                x: e.clientX,
                y: e.clientY,
                ...data
            });
        }
    }, [lockedDate, getHoverData]);

    return {
        hover, lockedDate,
        handleMouseEnter, handleMouseMove, handleMouseLeave,
        handleEventMouseEnter, handleRangeMouseEnter,
        toggleLock
    };
};


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
        addRange({ id: Math.random().toString(36).substring(7), start, end, createdAt: new Date() });
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

export const EventGroup = ({
    events,
    hour,
    onMouseEnter,
    onMouseMove,
    onMouseLeave,
    onClick
}: {
    events: CalendarEvent[];
    hour: Date;
    onMouseEnter?: (e: React.MouseEvent, event: CalendarEvent) => void;
    onMouseMove?: (e: React.MouseEvent) => void;
    onMouseLeave?: (e: React.MouseEvent) => void;
    onClick?: (e: React.MouseEvent, event: CalendarEvent) => void;
}) => {
    const hourEvents = events.filter((event) => isSameHour(event.start, hour));

    return (
        <div className="h-20 border-t last:border-b relative border-border/50 group/hour hover:bg-muted/10 transition-colors">
            {hourEvents.map((event) => {
                let hoursDifference = differenceInMinutes(event.end, event.start) / 60;
                const startPosition = event.start.getMinutes() / 60;

                // Prevent overflowing beyond the 24 hour grid. Limit to end of day.
                const remainingHoursInDay = 24 - hour.getHours() - startPosition;
                if (hoursDifference > remainingHoursInDay) {
                    hoursDifference = remainingHoursInDay;
                }

                // Very basic overlap calculation for current hour events
                const overlappingEvents = hourEvents.filter(e => {
                    return (e.start.getTime() < event.end.getTime() && e.end.getTime() > event.start.getTime());
                });
                // Sort overlapping events to get consistent index
                overlappingEvents.sort((a, b) => a.start.getTime() - b.start.getTime() || a.id.localeCompare(b.id));
                const overlapIndex = overlappingEvents.findIndex((e) => e.id === event.id);
                const overlapCount = overlappingEvents.length;

                const leftPercent = overlapCount > 1 ? (overlapIndex * (100 / overlapCount)) : 0;
                const widthPercent = overlapCount > 1 ? (100 / overlapCount) : 100;

                return (
                    <div
                        key={event.id}
                        onMouseEnter={(e) => onMouseEnter?.(e, event)}
                        onMouseMove={onMouseMove}
                        onMouseLeave={onMouseLeave}
                        onClick={(e) => onClick?.(e, event)}
                        className={cn(
                            'absolute rounded-md cursor-help group/event-chip shadow-sm border border-black/5 dark:border-white/5 transition-all hover:z-50 hover:shadow-md hover:brightness-110',
                            dayEventVariants({ variant: event.color })
                        )}
                        style={{
                            top: `calc(${startPosition * 100}% + 1px)`,
                            minHeight: `calc(max(24px, ${hoursDifference * 100}%) - 2px)`,
                            left: `calc(${leftPercent}% + 2px)`,
                            width: `calc(${widthPercent}% - 4px)`,
                            zIndex: 10 + overlapIndex
                        }}
                    >
                        <div className="p-1.5 flex flex-col gap-0.5 relative z-10">
                            <p className="text-[10px] md:text-[11px] font-black leading-tight break-words">{event.title}</p>

                            {event.description && (
                                <p className="text-[9px] md:text-[10px] opacity-90 font-medium break-words leading-snug">{event.description}</p>
                            )}

                            {event.tags && event.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-0.5">
                                    {event.tags.map((tag, idx) => (
                                        <span key={idx} className="text-[8px] font-black uppercase tracking-tighter bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded-sm">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {event.creator && (
                                <div className="flex items-center gap-1 mt-0.5 opacity-80">
                                    <span className="text-[8px] font-bold">Created by: {event.creator}</span>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// ─── Day View ─────────────────────────────────────────────────────────────────

export const CalendarDayView = () => {
    const { view, events, date, setSelectedDateForEvent, setIsEventModalOpen, setSelectedEventForEdit, ranges, draftStart, setDraftStart, addRange, renameRange, updateRangeDescription, updateEventTitle, updateEventDescription } = useCalendar();
    const dateHover = useDateHover(events);

    useEffect(() => {
        window.calendar_helpers = {
            setSelectedDateForEvent, setIsEventModalOpen,
            draftStart, setDraftStart, addRange,
            renameRange, updateRangeDescription,
            updateEventTitle, updateEventDescription,
            toggleLock: dateHover.toggleLock
        };
    }, [setSelectedDateForEvent, setIsEventModalOpen, draftStart, setDraftStart, addRange, renameRange, updateRangeDescription, updateEventTitle, updateEventDescription, dateHover.toggleLock]);

    if (view !== 'day') return null;
    const hours = [...Array(24)].map((_, i) => setHours(date, i));
    return (
        <div className="flex relative pt-2 overflow-auto h-full" onContextMenu={(e) => e.preventDefault()}>
            <DateHoverTooltip hover={dateHover.hover} ranges={ranges} isLocked={!!dateHover.lockedDate} />
            <TimeTable />
            <div
                className="flex-1 cursor-pointer"
                onDoubleClick={() => {
                    setSelectedDateForEvent(date);
                    setIsEventModalOpen(true);
                }}
            >
                {hours.map((hour) => (
                    <EventGroup
                        key={hour.toString()}
                        hour={hour}
                        events={events}
                        onMouseEnter={dateHover.handleEventMouseEnter}
                        onMouseMove={dateHover.handleMouseMove}
                        onMouseLeave={dateHover.handleMouseLeave}
                        onClick={(e, event) => {
                            e.stopPropagation();
                            setSelectedDateForEvent(event.start);
                            setSelectedEventForEdit(event);
                            setIsEventModalOpen(true);
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

// ─── Week View ────────────────────────────────────────────────────────────────

export const CalendarWeekView = () => {
    const { view, date, locale, events, setSelectedDateForEvent, setIsEventModalOpen, setSelectedEventForEdit, ranges, draftStart, setDraftStart, addRange, renameRange, updateRangeDescription, updateEventTitle, updateEventDescription } = useCalendar();
    const dateHover = useDateHover(events);

    useEffect(() => {
        window.calendar_helpers = {
            setSelectedDateForEvent, setIsEventModalOpen,
            draftStart, setDraftStart, addRange,
            renameRange, updateRangeDescription,
            updateEventTitle, updateEventDescription,
            toggleLock: dateHover.toggleLock
        };
    }, [setSelectedDateForEvent, setIsEventModalOpen, draftStart, setDraftStart, addRange, renameRange, updateRangeDescription, updateEventTitle, updateEventDescription, dateHover.toggleLock]);

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
        <div className="flex flex-col relative overflow-auto h-full scrollbar-hide" onContextMenu={(e) => e.preventDefault()}>
            <DateHoverTooltip hover={dateHover.hover} ranges={ranges} isLocked={!!dateHover.lockedDate} />
            <div className="flex sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 pb-2 pt-4">
                <div className="w-12" />
                {headerDays.map((d, i) => (
                    <div
                        key={d.toString()}
                        className="flex-1 flex flex-col items-center gap-1.5"
                    >
                        <span className={cn(
                            "text-[10px] font-black lowercase tracking-[0.2em] transition-colors",
                            [0, 6].includes(i) ? "text-red-500/50" : "text-emerald-500/80"
                        )}>
                            {format(d, i === 3 ? 'EEE' : 'EEEEEE', { locale }).toLowerCase()}
                        </span>
                        <span className={cn(
                            "size-8 grid place-content-center text-sm font-bold rounded-xl transition-all",
                            isToday(d)
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                                : "text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                        )}>
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
                            className={cn('h-full text-sm text-muted-foreground border-l first:border-l-0 cursor-pointer', [0, 6].includes(i) && 'bg-muted/50')}
                            onDoubleClick={() => {
                                setSelectedDateForEvent(hours[0]);
                                setIsEventModalOpen(true);
                            }}
                        >
                            {hours.map((hour) => (
                                <EventGroup
                                    key={hour.toString()}
                                    hour={hour}
                                    events={events}
                                    onMouseEnter={dateHover.handleEventMouseEnter}
                                    onMouseMove={dateHover.handleMouseMove}
                                    onMouseLeave={dateHover.handleMouseLeave}
                                    onClick={(e, event) => {
                                        e.stopPropagation();
                                        setSelectedDateForEvent(event.start);
                                        setSelectedEventForEdit(event);
                                        setIsEventModalOpen(true);
                                    }}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ─── Month View ───────────────────────────────────────────────────────────────

export const CalendarMonthView = () => {
    const { date, setDate, view, events, locale, setSelectedDateForEvent, setIsEventModalOpen, deleteEvent, setSelectedEventForEdit, ranges, readOnly, draftStart, setDraftStart, addRange, renameRange, updateRangeDescription, updateEventTitle, updateEventDescription } = useCalendar();
    const { showError } = useToast();
    const { getRangeInfo, isDraftStart } = useRangeHelpers();
    const dateHover = useDateHover(events);

    useEffect(() => {
        window.calendar_helpers = {
            setSelectedDateForEvent, setIsEventModalOpen,
            draftStart, setDraftStart, addRange,
            renameRange, updateRangeDescription,
            updateEventTitle, updateEventDescription,
            toggleLock: dateHover.toggleLock
        };
    }, [setSelectedDateForEvent, setIsEventModalOpen, draftStart, setDraftStart, addRange, renameRange, updateRangeDescription, updateEventTitle, updateEventDescription, dateHover.toggleLock]);

    const monthDates = useMemo(() => getDaysInMonth(date), [date]);
    const weekDays = useMemo(() => generateWeekdays(locale), [locale]);
    const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);

    if (view !== 'month') return null;

    const handleContextMenu = (e: React.MouseEvent, d: Date) => {
        if (readOnly) return;
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
            <DateHoverTooltip hover={dateHover.hover} ranges={ranges} isLocked={!!dateHover.lockedDate} />

            <div className="grid grid-cols-7 sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-800/50">
                {weekDays.map((day, i) => (
                    <div
                        key={day}
                        className="py-3 text-center"
                    >
                        <span className={cn(
                            "text-[10px] font-black lowercase tracking-[0.3em] transition-colors",
                            [0, 6].includes(i) ? "text-red-500" : "text-emerald-500"
                        )}>
                            {day.toLowerCase()}
                        </span>
                    </div>
                ))}
            </div>

            <div className="grid flex-1 auto-rows-fr grid-cols-7 overflow-y-auto no-scrollbar min-h-0">
                {monthDates.map((_date) => {
                    const currentEvents = events.filter((ev) => isSameDay(ev.start, _date));
                    const rangeInfo = getRangeInfo(_date);
                    const { inRange, matches } = rangeInfo;
                    const draft = isDraftStart(_date);
                    const dayMatches = [...matches].sort((a, b) => a.rangeIndex - b.rangeIndex);

                    // --- Hidden items logic (1 range, 1 event cap) ---
                    const MAX_RANGES = 1;
                    const MAX_EVENTS = 1;
                    const toShowRanges = dayMatches.slice(0, MAX_RANGES);
                    const toShowEvents = currentEvents.slice(0, MAX_EVENTS);
                    const hiddenCount = (dayMatches.length - toShowRanges.length) + (currentEvents.length - toShowEvents.length);

                    return (
                        <div
                            key={_date.toString()}
                            onClick={(e) => {
                                setDate(_date);
                                dateHover.toggleLock(e, _date, matches);
                            }}
                            onDoubleClick={() => { if (!readOnly) { setSelectedDateForEvent(_date); setIsEventModalOpen(true); } }}
                            onContextMenu={(e) => handleContextMenu(e, _date)}
                            onMouseEnter={(e) => dateHover.handleMouseEnter(e, _date, matches)}
                            onMouseMove={dateHover.handleMouseMove}
                            onMouseLeave={dateHover.handleMouseLeave}
                            className={cn(
                                'p-1 md:p-2 text-sm border-r border-b border-gray-200 dark:border-gray-800 text-muted-foreground overflow-y-auto overflow-x-hidden no-scrollbar cursor-pointer transition-all duration-300 relative select-none min-h-[80px]',
                                'group hover:z-30 hover:-translate-y-1.5 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] hover:bg-white dark:hover:bg-gray-800 hover:border-transparent hover:rounded-2xl',
                                !isSameMonth(date, _date) && 'text-muted-foreground/50',
                                isSameDay(date, _date) && !inRange && 'bg-muted/10',
                                'flex flex-col gap-1',
                                (toShowRanges.length === 0 && toShowEvents.length === 0) ? 'justify-center' : 'justify-start'
                            )}
                        >
                            {/* Date number */}
                            <div className={cn("flex items-center justify-center relative transition-transform duration-300 group-hover:-translate-y-1", (toShowRanges.length > 0 || toShowEvents.length > 0) ? "mb-1" : "")}>
                                <span
                                    className={cn(
                                        "h-6 min-w-[24px] flex items-center justify-center px-1 rounded-full transition-all duration-300 font-medium text-xs z-10",
                                        "group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-md group-hover:scale-110",
                                        isToday(_date) ? "bg-primary text-primary-foreground" :
                                            isSameDay(date, _date) ? "bg-primary/20 text-primary" : ""
                                    )}
                                >
                                    <span className="max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 group-hover:mr-1 overflow-hidden transition-all duration-300 font-bold block">
                                        {format(_date, 'MMM')}
                                    </span>
                                    <span>{format(_date, 'd')}</span>
                                </span>
                                {draft && (
                                    <span className="absolute right-0 text-[8px] text-emerald-500 font-bold animate-pulse">SET END</span>
                                )}
                            </div>

                            {/* Range Bars (Google Calendar Style) */}
                            {toShowRanges.length > 0 && (
                                <div className="flex flex-col gap-0.5 mb-1 min-h-[4px]">
                                    {toShowRanges.map((m) => {
                                        const r = ranges[m.rangeIndex];
                                        if (!r) return null;
                                        const s = getRangeStyle(m.colorIndex ?? m.rangeIndex);
                                        const showLabel = m.isStart || m.isFirstInWeek;

                                        return (
                                            <div
                                                key={r.id}
                                                onMouseEnter={(e) => { e.stopPropagation(); dateHover.handleRangeMouseEnter(e, r, m.rangeIndex); }}
                                                onMouseMove={dateHover.handleMouseMove}
                                                onMouseLeave={dateHover.handleMouseLeave}
                                                className={cn(
                                                    "flex items-center transition-all cursor-help",
                                                    m.isStart && "ml-1",
                                                    m.isEnd && "mr-1",
                                                    !m.isStart && !m.isEnd && "mx-0"
                                                )}
                                            >
                                                {m.isStart && <div className="w-[3px] h-3 md:h-4 rounded-full shrink-0" style={{ backgroundColor: s.capBg }} />}
                                                <div
                                                    className={cn(
                                                        "h-1.5 md:h-3 flex items-center flex-1 px-1 md:px-1.5 text-[8px] md:text-[10px] font-bold text-white shadow-sm",
                                                        m.isStart && "rounded-l-sm ml-[1px]",
                                                        m.isEnd && "rounded-r-sm mr-[1px]",
                                                    )}
                                                    style={{ backgroundColor: s.capBg }}
                                                >
                                                    {showLabel && (
                                                        <span className="truncate drop-shadow-sm hidden md:block">
                                                            {r.label || `Range #${m.rangeIndex + 1}`}
                                                        </span>
                                                    )}
                                                </div>
                                                {m.isEnd && <div className="w-[3px] h-3 md:h-4 rounded-full shrink-0" style={{ backgroundColor: s.capBg }} />}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {toShowEvents.map((event) => (
                                <div
                                    key={event.id}
                                    onMouseEnter={(e) => { e.stopPropagation(); dateHover.handleEventMouseEnter(e, event); }}
                                    onMouseMove={dateHover.handleMouseMove}
                                    onMouseLeave={dateHover.handleMouseLeave}
                                    className="px-1 py-0.5 rounded border border-box text-[9px] md:text-[11px] font-medium flex items-center gap-1 group/ev bg-card cursor-help"
                                >
                                    <div className={cn('shrink-0', monthEventVariants({ variant: event.color }))} />
                                    <span className="flex-1 truncate leading-tight">{event.title}</span>
                                    {!readOnly && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedDateForEvent(event.start);
                                                    setSelectedEventForEdit(event);
                                                    setIsEventModalOpen(true);
                                                }}
                                                className="ml-auto opacity-0 group-hover/ev:opacity-100 transition-opacity text-muted-foreground/60 hover:text-blue-500 text-[10px] leading-none rounded-full size-3.5 flex items-center justify-center hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                                title="Edit event"
                                            >✏️</button>
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); deleteEvent(event.id); showError(`Event "${event.title}" deleted`); }}
                                                className="ml-0.5 opacity-0 group-hover/ev:opacity-100 transition-opacity text-muted-foreground/60 hover:text-red-500 text-[10px] leading-none rounded-full size-3.5 flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/30"
                                                title="Delete event"
                                            >✕</button>
                                        </>
                                    )}
                                </div>
                            ))}

                            {hiddenCount > 0 && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        dateHover.toggleLock(e, _date, matches);
                                    }}
                                    className="mt-auto mx-1 py-1 rounded-md text-[9px] md:text-[10px] font-black uppercase tracking-wider text-primary bg-primary/5 hover:bg-primary/10 border border-primary/10 transition-all text-center animate-in fade-in slide-in-from-bottom-1 duration-300"
                                >
                                    + {hiddenCount} more
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ─── Year View ────────────────────────────────────────────────────────────────

export const CalendarYearView = () => {
    const { date, setDate, view, events, locale, setSelectedDateForEvent, setIsEventModalOpen, ranges, readOnly, draftStart, setDraftStart, addRange, renameRange, updateRangeDescription, updateEventTitle, updateEventDescription } = useCalendar();
    const { getRangeInfo } = useRangeHelpers();
    const dateHover = useDateHover(events);

    useEffect(() => {
        window.calendar_helpers = {
            setSelectedDateForEvent, setIsEventModalOpen,
            draftStart, setDraftStart, addRange,
            renameRange, updateRangeDescription,
            updateEventTitle, updateEventDescription,
            toggleLock: dateHover.toggleLock
        };
    }, [setSelectedDateForEvent, setIsEventModalOpen, draftStart, setDraftStart, addRange, renameRange, updateRangeDescription, updateEventTitle, updateEventDescription, dateHover.toggleLock]);

    const months = useMemo(() => {
        if (!view) return [];
        return Array.from({ length: 12 }, (_, i) => getDaysInMonth(setMonth(date, i)));
    }, [date, view]);

    const weekDays = useMemo(() => generateWeekdays(locale), [locale]);
    const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);

    if (view !== 'year') return null;

    const handleContextMenu = (e: React.MouseEvent, d: Date) => {
        if (readOnly) return;
        e.preventDefault();
        e.stopPropagation();
        const menuW = 210, menuH = 230;
        let x = e.clientX + 6, y = e.clientY + 6;
        if (x + menuW > window.innerWidth) x = e.clientX - menuW - 6;
        if (y + menuH > window.innerHeight) y = e.clientY - menuH - 6;
        setContextMenu({ x, y, date: d });
    };

    return (
        <div className="grid grid-cols-1 min-[540px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-10 overflow-auto h-full p-2 md:p-4 scrollbar-hide">
            <DateRangeContextMenu menu={contextMenu} onClose={() => setContextMenu(null)} />
            <DateHoverTooltip hover={dateHover.hover} ranges={ranges} isLocked={!!dateHover.lockedDate} />

            {months.map((days, i) => (
                <div key={days[0].toString()}>
                    <span className="flex justify-center text-lg md:text-xl font-medium">
                        {format(setMonth(new Date(), i), 'MMMM', { locale })}
                    </span>

                    <div className="grid grid-cols-7 gap-1 md:gap-2 my-3 md:my-5">
                        {weekDays.map((day, i) => (
                            <div
                                key={day}
                                className="text-center truncate"
                            >
                                <span className={cn(
                                    "text-[9px] font-black lowercase tracking-widest transition-colors",
                                    [0, 6].includes(i) ? "text-red-500/40" : "text-emerald-500/70"
                                )}>
                                    {day}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="grid gap-x-1 md:gap-x-2 text-center grid-cols-7 text-xs tabular-nums">
                        {days.map((_date) => {
                            const belongsHere = getMonth(_date) === i;
                            const rangeInfo = getRangeInfo(_date);
                            const { matches } = rangeInfo;

                            const dayMatches = [...matches].sort((a, b) => a.rangeIndex - b.rangeIndex);

                            return (
                                <div
                                    key={_date.toString()}
                                    title={format(_date, 'PPPP')}
                                    onContextMenu={(e) => handleContextMenu(e, _date)}
                                    onMouseEnter={belongsHere ? (e) => dateHover.handleMouseEnter(e, _date, matches) : undefined}
                                    onMouseMove={belongsHere ? dateHover.handleMouseMove : undefined}
                                    onMouseLeave={belongsHere ? dateHover.handleMouseLeave : undefined}
                                >
                                    <div className="relative size-full pt-1 pb-1.5 px-0.5">
                                        <div
                                            onClick={(e) => {
                                                setDate(_date);
                                                dateHover.toggleLock(e, _date, matches);
                                            }}
                                            onDoubleClick={() => { if (!readOnly) { setSelectedDateForEvent(_date); setIsEventModalOpen(true); } }}
                                            className={cn(
                                                'aspect-square grid place-content-center size-full tabular-nums cursor-pointer rounded-full transition-colors select-none text-[10px]',
                                                isSameDay(date, _date) && belongsHere && 'bg-primary/20 text-primary font-medium',
                                                isToday(_date) && belongsHere && 'bg-primary text-primary-foreground font-normal',
                                                !belongsHere && 'opacity-30'
                                            )}
                                        >
                                            {format(_date, 'd')}
                                        </div>

                                        {/* Simplified Range Lines for Year View */}
                                        <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-0.5 px-0.5 pointer-events-none">
                                            {dayMatches.map((m) => {
                                                const s = getRangeStyle(m.colorIndex ?? m.rangeIndex);
                                                return (
                                                    <div
                                                        key={m.rangeIndex}
                                                        className={cn(
                                                            "flex items-center w-full transition-all",
                                                            m.isStart && "pl-0.5",
                                                            m.isEnd && "pr-0.5"
                                                        )}
                                                    >
                                                        {m.isStart && <div className="w-[2px] h-1.5 rounded-full" style={{ backgroundColor: s.capBg }} />}
                                                        <div className="h-0.5 flex-1" style={{ backgroundColor: s.capBg }} />
                                                        {m.isEnd && <div className="w-[2px] h-1.5 rounded-full" style={{ backgroundColor: s.capBg }} />}
                                                    </div>
                                                );
                                            })}
                                        </div>
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
