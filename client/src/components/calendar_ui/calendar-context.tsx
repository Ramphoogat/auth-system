import { type VariantProps, cva } from 'class-variance-authority';
import type { Locale } from 'date-fns';
import { createContext, useContext } from 'react';

export const monthEventVariants = cva('size-2 rounded-full', {
    variants: {
        variant: {
            default: 'bg-primary',
            blue: 'bg-blue-500',
            green: 'bg-green-500',
            pink: 'bg-pink-500',
            purple: 'bg-purple-500',
        },
    },
    defaultVariants: {
        variant: 'default',
    },
});

export const dayEventVariants = cva('font-bold border-l-4 rounded p-2 text-xs', {
    variants: {
        variant: {
            default: 'bg-muted/30 text-muted-foreground border-muted',
            blue: 'bg-blue-500/30 text-blue-600 border-blue-500',
            green: 'bg-green-500/30 text-green-600 border-green-500',
            pink: 'bg-pink-500/30 text-pink-600 border-pink-500',
            purple: 'bg-purple-500/30 text-purple-600 border-purple-500',
        },
    },
    defaultVariants: {
        variant: 'default',
    },
});

export type View = 'day' | 'week' | 'month' | 'year';

export type CalendarEvent = {
    id: string;
    start: Date;
    end: Date;
    title: string;
    type?: 'task';
    color?: VariantProps<typeof monthEventVariants>['variant'];
    description?: string;
    tags?: string[];
    creator?: string;
    createdAt?: Date;
};

export type DateRange = {
    id: string;
    start: Date;
    end: Date;
    label?: string;
    description?: string;
    colorIndex?: number;
    createdAt?: Date;
    googleEventId?: string;
    googleCalendarId?: string;
};

type ContextType = {
    view: View;
    setView: (view: View) => void;
    date: Date;
    setDate: (date: Date) => void;
    events: CalendarEvent[];
    locale: Locale;
    setEvents: (events: CalendarEvent[]) => void;
    onChangeView?: (view: View) => void;
    onEventClick?: (event: CalendarEvent) => void;
    enableHotkeys?: boolean;
    today: Date;
    isEventModalOpen: boolean;
    setIsEventModalOpen: (open: boolean) => void;
    selectedDateForEvent: Date | null;
    setSelectedDateForEvent: (date: Date | null) => void;
    selectedEventForEdit: CalendarEvent | null;
    setSelectedEventForEdit: (event: CalendarEvent | null) => void;
    isTasksPanelOpen: boolean;
    setIsTasksPanelOpen: (open: boolean) => void;
    deleteEvent: (id: string) => void;
    clearAllEvents: () => void;
    undoDelete: () => void;
    updateEventTitle: (id: string, title: string) => void;
    updateEventDescription: (id: string, description: string) => void;
    // Multi-range support
    ranges: DateRange[];
    draftStart: Date | null;
    setDraftStart: (d: Date | null) => void;
    addRange: (range: DateRange) => void;
    deleteRange: (id: string) => void;
    undoDeleteRange: () => void;
    renameRange: (id: string, label: string) => void;
    updateRangeDescription: (id: string, description: string) => void;
    updateRangeColor: (id: string, colorIndex: number) => void;
    readOnly?: boolean;
};

export const Context = createContext<ContextType>({} as ContextType);

export const useCalendar = () => useContext(Context);
