import { type Locale } from 'date-fns';
import {
    addDays,
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
    const startOfMonthDate    = startOfMonth(date);
    const startOfWeekForMonth = startOfWeek(startOfMonthDate, { weekStartsOn: 0 });
    let currentDate = startOfWeekForMonth;
    const calendar: Date[] = [];
    while (calendar.length < 42) {
        calendar.push(new Date(currentDate));
        currentDate = addDays(currentDate, 1);
    }
    return calendar;
};

export const generateWeekdays = (locale: Locale) => {
    const days: string[] = [];
    for (let i = 0; i < 7; i++) {
        days.push(format(addDays(startOfWeek(new Date(), { weekStartsOn: 0 }), i), 'EEEEEE', { locale }));
    }
    return days;
};

// ─── Range color helpers ──────────────────────────────────────────────────────

// Hues: amber, blue, purple, green, rose, teal, orange
export const RANGE_HUES = [38, 217, 270, 142, 350, 186, 25] as const;

export const getRangeStyle = (index: number) => {
    const hue = RANGE_HUES[index % RANGE_HUES.length];
    return {
        bg:     `hsla(${hue}, 80%, 55%, 0.13)`,
        capBg:  `hsl(${hue}, 68%, 48%)`,
        capRing:`hsla(${hue}, 80%, 55%, 0.35)`,
        dot:    `hsl(${hue}, 68%, 48%)`,
        label:  `hsl(${hue}, 68%, 42%)`,
    };
};

// ─── useRangeHelpers hook ─────────────────────────────────────────────────────

export const useRangeHelpers = () => {
    const { ranges, draftStart } = useCalendar();

    const getRangeInfo = (d: Date): {
        inRange: boolean; isStart: boolean; isEnd: boolean;
        isSingleDay: boolean; colorIndex: number;
    } => {
        const day = startOfDay(d);
        for (let i = 0; i < ranges.length; i++) {
            const r = ranges[i];
            const s = startOfDay(isBefore(r.start, r.end) ? r.start : r.end);
            const e = startOfDay(isBefore(r.start, r.end) ? r.end   : r.start);
            if (!isBefore(day, s) && !isAfter(day, e)) {
                return {
                    inRange:    true,
                    isStart:    isSameDay(d, s),
                    isEnd:      isSameDay(d, e),
                    isSingleDay:isSameDay(s, e),
                    colorIndex: i,
                };
            }
        }
        return { inRange: false, isStart: false, isEnd: false, isSingleDay: false, colorIndex: -1 };
    };

    const isDraftStart = (d: Date) => !!draftStart && isSameDay(d, draftStart);

    return { getRangeInfo, isDraftStart };
};
