import { type Locale } from 'date-fns';
import {
    addDays,
    endOfMonth,
    endOfWeek,
    format,
    isAfter,
    isBefore,
    isSameDay,
    startOfDay,
    startOfMonth,
    startOfWeek,
} from 'date-fns';
import { useCalendar } from './calendar-context';

// ─── Day/month generation ─────────────────────────────────────────────────────

export const getDaysInMonth = (date: Date) => {
    const startOfMonthDate = startOfMonth(date);
    const endOfMonthDate = endOfMonth(startOfMonthDate);
    const startOfWeekForMonth = startOfWeek(startOfMonthDate, { weekStartsOn: 0 });
    const endOfWeekForMonth = endOfWeek(endOfMonthDate, { weekStartsOn: 0 });

    let currentDate = startOfWeekForMonth;
    const calendar: Date[] = [];
    
    // Generate dates based on the natural weeks required for the month
    while (isBefore(currentDate, endOfWeekForMonth) || isSameDay(currentDate, endOfWeekForMonth)) {
        calendar.push(new Date(currentDate));
        currentDate = addDays(currentDate, 1);
    }

    // Ensure we always show at least 5 rows (35 days) so next-month dates are visible in Feb too.
    // This also removes the "extra" 6th row if it's not strictly needed for the current month.
    while (calendar.length < 35) {
        calendar.push(new Date(currentDate));
        currentDate = addDays(currentDate, 1);
    }
    
    return calendar;
};

export const generateWeekdays = (locale: Locale) => {
    const days: string[] = [];
    const baseDate = startOfWeek(new Date(), { weekStartsOn: 0 });
    for (let i = 0; i < 7; i++) {
        const d = addDays(baseDate, i);
        // User requested: su, mo, tu, wed, th, fr, sa
        const label = i === 3 ? format(d, 'EEE', { locale }) : format(d, 'EEEEEE', { locale });
        days.push(label.toLowerCase());
    }
    return days;
};

// ─── Range color helpers ──────────────────────────────────────────────────────

// HSL mapping with Google Calendar colorIds
export const RANGE_COLORS = [
    { id: '11', h: 0,   s: 85,  l: 50 }, // Tomato/Red
    { id: '4',  h: 355, s: 65,  l: 65 }, // Flamingo/Pink
    { id: '6',  h: 15,  s: 85,  l: 55 }, // Tangerine/Orange
    { id: '5',  h: 45,  s: 90,  l: 55 }, // Banana/Yellow
    { id: '2',  h: 152, s: 55,  l: 50 }, // Sage/Light Green
    { id: '10', h: 150, s: 85,  l: 30 }, // Basil/Dark Green
    { id: '7',  h: 199, s: 95,  l: 45 }, // Peacock/Cyan
    { id: '9',  h: 225, s: 65,  l: 55 }, // Blueberry/Blue
    { id: '1',  h: 235, s: 55,  l: 65 }, // Lavender/Indigo
    { id: '3',  h: 285, s: 70,  l: 45 }, // Grape/Purple
    { id: '8',  h: 0,   s: 0,   l: 40 }, // Graphite/Gray
] as const;

export const getRangeStyle = (index: number) => {
    const c = RANGE_COLORS[index % RANGE_COLORS.length];
    return {
        bg:     `hsla(${c.h}, ${c.s}%, ${c.l}%, 0.12)`,
        capBg:  `hsl(${c.h}, ${c.s}%, ${c.l}%)`,
        capRing:`hsla(${c.h}, ${c.s}%, ${c.l}%, 0.35)`,
        dot:    `hsl(${c.h}, ${c.s}%, ${c.l}%)`,
        label:  `hsl(${c.h}, ${c.s}%, ${c.l}%)`,
    };
};

// ─── useRangeHelpers hook ─────────────────────────────────────────────────────

export type RangeMatch = {
    rangeIndex: number;
    isStart: boolean;
    isEnd: boolean;
    isSingleDay: boolean;
    isFirstInWeek: boolean;
    colorIndex: number;
};

export type RangeInfo = {
    inRange: boolean;
    isStart: boolean;
    isEnd: boolean;
    isSingleDay: boolean;
    colorIndex: number;
    /** All matching ranges for this date (supports overlapping ranges) */
    matches: RangeMatch[];
};



export const useRangeHelpers = () => {
    const { ranges, draftStart } = useCalendar();

    const getRangeInfo = (d: Date): RangeInfo => {
        const day = startOfDay(d);
        const matches: RangeMatch[] = [];

        for (let i = 0; i < ranges.length; i++) {
            const r = ranges[i];
            const s = startOfDay(isBefore(r.start, r.end) ? r.start : r.end);
            const e = startOfDay(isBefore(r.start, r.end) ? r.end   : r.start);
            if (!isBefore(day, s) && !isAfter(day, e)) {
                matches.push({
                    rangeIndex: i,
                    isStart:    isSameDay(d, s),
                    isEnd:      isSameDay(d, e),
                    isSingleDay:isSameDay(s, e),
                    isFirstInWeek: startOfWeek(d, { weekStartsOn: 0 }).getTime() === day.getTime(),
                    colorIndex: r.colorIndex ?? i,
                });
            }
        }

        if (matches.length === 0) {
            return { inRange: false, isStart: false, isEnd: false, isSingleDay: false, colorIndex: -1, matches: [] };
        }

        // Primary match (first range) for backward-compat
        const first = matches[0];
        return {
            inRange: true,
            isStart: first.isStart,
            isEnd: first.isEnd,
            isSingleDay: first.isSingleDay,
            colorIndex: first.colorIndex ?? first.rangeIndex,
            matches,
        };
    };

    const isDraftStart = (d: Date) => !!draftStart && isSameDay(d, draftStart);

    return { getRangeInfo, isDraftStart };
};
