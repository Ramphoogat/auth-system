import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { format, isBefore, isSameHour, startOfDay, differenceInMinutes } from 'date-fns';
import { cn } from '../../lib/utils';
import {
    dayEventVariants,
    monthEventVariants,
    useCalendar,
    type CalendarEvent,
    type DateRange,
} from './calendar-context';
import {
    getRangeStyle,
} from './calendar-utils';
import { type HoverState, type ContextMenuState } from './calendar-shared-types';

// ─── Date Hover Tooltip ───────────────────────────────────────────────────────

export const DateHoverTooltip = ({ hover, ranges, isLocked }: { hover: HoverState; ranges: DateRange[]; isLocked?: boolean }) => {
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

                {rangeMatches.length > 0 && events.length > 0 && (
                    <div className="h-px bg-border mx-3" />
                )}

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

export const TooltipAction = ({ onClick, icon, label, color }: { onClick: (e: React.MouseEvent) => void; icon: string; label: string; color: 'blue' | 'emerald' }) => (
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

// ─── Date Range Context Menu ──────────────────────────────────────────────────

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

                const remainingHoursInDay = 24 - hour.getHours() - startPosition;
                if (hoursDifference > remainingHoursInDay) {
                    hoursDifference = remainingHoursInDay;
                }

                const overlappingEvents = hourEvents.filter(e => {
                    return (e.start.getTime() < event.end.getTime() && e.end.getTime() > event.start.getTime());
                });
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
