import { useEffect, useMemo, useState } from 'react';
import { format, getMonth, isSameDay, isToday, setMonth } from 'date-fns';
import { cn } from '../../lib/utils';
import { useCalendar } from './calendar-context';
import {
    getDaysInMonth,
    generateWeekdays,
    getRangeStyle,
    useRangeHelpers,
} from './calendar-utils';
import {
    DateHoverTooltip,
    DateRangeContextMenu,
} from './CalendarShared';
import { useDateHover } from './calendar-shared-hooks';
import { type ContextMenuState } from './calendar-shared-types';

export const CalendarYearView = () => {
    const {
        date,
        setDate,
        view,
        events,
        locale,
        setSelectedDateForEvent,
        setIsEventModalOpen,
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

    const { getRangeInfo } = useRangeHelpers();
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
