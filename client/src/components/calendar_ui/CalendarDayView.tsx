import { useEffect } from 'react';
import { setHours } from 'date-fns';
import { useCalendar } from './calendar-context';
import {
    DateHoverTooltip,
    TimeTable,
    EventGroup,
} from './CalendarShared';
import { useDateHover } from './calendar-shared-hooks';

export const CalendarDayView = () => {
    const {
        view,
        events,
        date,
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

    if (view !== 'day') return null;

    const hours = [...Array(24)].map((_, i) => setHours(date, i));

    return (
        <div className="flex relative pt-2 overflow-auto h-full" onContextMenu={(e) => e.preventDefault()}>
            <DateHoverTooltip hover={dateHover.hover} ranges={ranges} isLocked={!!dateHover.lockedDate} />
            <TimeTable />
            <div
                className="flex-1 cursor-pointer"
                onDoubleClick={() => {
                    setSelectedDateForEvent(date);
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
        </div>
    );
};
