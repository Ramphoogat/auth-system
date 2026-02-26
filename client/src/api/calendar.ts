import api from './axios';
import type { CalendarEvent, DateRange } from '../components/calendar_ui/calendar-context';

export type CalendarPayload = {
    events: CalendarEvent[];
    ranges: DateRange[];
};

/** Load this user's saved calendar data from the server. */
export const fetchCalendarData = async (): Promise<CalendarPayload> => {
    const res = await api.get<Omit<CalendarPayload, 'events'>>('/calendar');
    // Dates arrive as ISO strings from JSON — rehydrate them
    return {
        events: [], // NO LOCAL EVENTS 
        ranges: res.data.ranges.map((r) => ({
            ...r,
            start: new Date(r.start),
            end:   new Date(r.end),
            createdAt: r.createdAt ? new Date(r.createdAt) : undefined,
        })),
    };
};

/** Persist the full calendar state for this user. */
export const saveCalendarData = async (payload: CalendarPayload): Promise<void> => {
    // Format range dates as simple strings to avoid timezone shifts during JSON serialization
    const formattedRanges = payload.ranges.map(r => ({
        ...r,
        start: r.start instanceof Date ? r.start.getFullYear() + '-' + String(r.start.getMonth() + 1).padStart(2, '0') + '-' + String(r.start.getDate()).padStart(2, '0') : r.start,
        end:   r.end instanceof Date   ? r.end.getFullYear()   + '-' + String(r.end.getMonth() + 1).padStart(2, '0')   + '-' + String(r.end.getDate()).padStart(2, '0')   : r.end,
    }));

    await api.put('/calendar', {
        ...payload,
        ranges: formattedRanges
    });
};

/** Sync with Google Calendar to fetch latest events */
export const syncCalendarData = async (): Promise<CalendarPayload> => {
    const res = await api.post<CalendarPayload>('/calendar/sync');
    return {
        events: res.data.events.map((e) => ({
            ...e,
            start:     new Date(e.start),
            end:       new Date(e.end),
            createdAt: e.createdAt ? new Date(e.createdAt) : undefined,
        })),
        ranges: res.data.ranges.map((r) => ({
            ...r,
            start: new Date(r.start),
            end:   new Date(r.end),
            createdAt: r.createdAt ? new Date(r.createdAt) : undefined,
        })),
    };
};

/** Clear all events from the database for the current user */
export const clearAllCalendarEvents = async (): Promise<void> => {
    await api.delete('/calendar/events');
};
