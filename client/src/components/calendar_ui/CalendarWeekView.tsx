import { useEffect, useMemo } from 'react';
import { addDays, format, isToday, setHours, startOfWeek } from 'date-fns';
import { cn } from '../../lib/utils';
import { useCalendar } from './calendar-context';
import {
    DateHoverTooltip,
    TimeTable,
    EventGroup,
} from './CalendarShared';
import { useDateHover } from './calendar-shared-hooks';

export const CalendarWeekView = () => {
    const {
        view,
        date,
        locale,
        events,
        setSelectedDateForEvent,
        setIsEventModalOpen,
        setSelectedEventForEdit,
        ranges,
        draftStart,
        setDraftStart,
        addRange,
        renameRange,
        updateRangeDescription,
        updateEventTitle,
        updateEventDescription
    } = useCalendar();

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
