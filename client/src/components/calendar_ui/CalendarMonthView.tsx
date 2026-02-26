import { useEffect, useMemo, useState } from 'react';
import { format, isSameDay, isSameMonth, isToday } from 'date-fns';
import { cn } from '../../lib/utils';
import { monthEventVariants, useCalendar } from './calendar-context';
import { useToast } from '../ToastProvider';
import {
    getDaysInMonth,
    generateWeekdays,
    getRangeStyle,
    useRangeHelpers,
} from './calendar-utils';
import { FiEdit3 } from 'react-icons/fi';
import {
    DateHoverTooltip,
    DateRangeContextMenu,
} from './CalendarShared';
import { useDateHover } from './calendar-shared-hooks';
import { type ContextMenuState } from './calendar-shared-types';

export const CalendarMonthView = () => {
    const {
        date,
        setDate,
        view,
        events,
        locale,
        setSelectedDateForEvent,
        setIsEventModalOpen,
        deleteEvent,
        setSelectedEventForEdit,
        ranges,
        readOnly,
        draftStart,
        setDraftStart,
        addRange,
        renameRange,
        updateRangeDescription,
        updateEventTitle,
        updateEventDescription
    } = useCalendar();

    const { showError } = useToast();
    const { getRangeInfo, isDraftStart } = useRangeHelpers();
    const dateHover = useDateHover(events);

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
            toggleLock: dateHover.toggleLock
        };
    }, [
        setSelectedDateForEvent,
        setIsEventModalOpen,
        draftStart,
        setDraftStart,
        addRange,
        renameRange,
        updateRangeDescription,
        updateEventTitle,
        updateEventDescription,
        dateHover.toggleLock
    ]);

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

                            {/* Range Bars */}
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
                                                className="ml-auto opacity-100 md:opacity-0 md:group-hover/ev:opacity-100 transition-opacity text-muted-foreground/60 hover:text-blue-500 text-[10px] leading-none rounded-full size-3.5 flex items-center justify-center hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                                title="Edit event"
                                            ><FiEdit3 /></button>
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); deleteEvent(event.id); showError(`Event "${event.title}" deleted`); }}
                                                className="ml-0.5 opacity-100 md:opacity-0 md:group-hover/ev:opacity-100 transition-opacity text-muted-foreground/60 hover:text-red-500 text-[10px] leading-none rounded-full size-3.5 flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/30"
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
