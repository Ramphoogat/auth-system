import api from './axios';
import type { CalendarEvent, DateRange } from '../components/calendar_ui/calendar-context';

export type CalendarPayload = {
    events: CalendarEvent[];
    ranges: DateRange[];
};

/** Load this user's saved calendar data from the server. */
export const fetchCalendarData = async (): Promise<CalendarPayload> => {
    const res = await api.get<CalendarPayload>('/calendar');
    // Dates arrive as ISO strings from JSON — rehydrate them
    return {
        events: res.data.events.map((e) => ({
            ...e,
            start:     new Date(e.start),
            end:       new Date(e.end),
            createdAt: new Date(e.createdAt),
        })),
        ranges: res.data.ranges.map((r) => ({
            ...r,
            start: new Date(r.start),
            end:   new Date(r.end),
        })),
    };
};

/** Persist the full calendar state for this user. */
export const saveCalendarData = async (payload: CalendarPayload): Promise<void> => {
    await api.put('/calendar', payload);
};
