import { type CalendarEvent } from './calendar-context';
import { type RangeMatch } from './calendar-utils';

export type HoverState = {
    x: number;
    y: number;
    date: Date;
    events: CalendarEvent[];
    rangeMatches: RangeMatch[];
} | null;

export type ContextMenuState = { x: number; y: number; date: Date } | null;
