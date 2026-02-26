import { useCallback, useEffect, useRef, useState } from 'react';
import { isSameDay } from 'date-fns';
import { type CalendarEvent, type DateRange } from './calendar-context';
import { type RangeMatch } from './calendar-utils';
import { type HoverState } from './calendar-shared-types';

export const useDateHover = (events: CalendarEvent[]) => {
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
        }, 200);
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
