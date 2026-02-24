# Technical Architecture Overview: Calendar, Google Integration & Notifications

This document outlines the core implementation details and architectural patterns used for the Calendar system, Google Calendar synchronization, and the global Notification service.

---

### 1. Calendar Engine & Range Logic

Built using `date-fns` for temporal logic and a Context-based state management system.

#### **A. State Management & Grid Generation**

- **Grid Normalization**: We utilize a `getDaysInMonth` utility that always generates a **42-day array** (6 weeks).
  - _Location_: `client/src/components/calendar_ui/calendar-utils.ts` **(Lines 16-26)**
- **State Store**: Manages `events`, `ranges`, and `view`.
  - _Location_: `client/src/components/calendar_ui/calendar-context.tsx`

#### **B. Date Range Implementation**

- **Selection Workflow**: `DateRangeContextMenu` handles the `draftStart` state for non-contiguous selection.
  - _Location_: `client/src/components/calendar_ui/CalendarViews.tsx` **(Lines 221-334)**
- **Range Metadata**: `getRangeInfo` calculates overlaps, start/end markers, and week-first labels.
  - _Location_: `client/src/components/calendar_ui/calendar-utils.ts` **(Lines 90-124)**
- **UI Rendering**: Month view logic for rendering multi-day range bars with Google-style styling.
  - _Location_: `client/src/components/calendar_ui/CalendarViews.tsx` **(Lines 548-575)**

---

### 2. Google Calendar Synchronization (Bi-directional)

Implemented on the Node.js/Express backend using the official `googleapis` library.

#### **A. Sync Mechanics**

- **Read Operation**: `syncGoogleCalendar` fetches from external API and merges with local DB.
  - _Location_: `server/src/controllers/calendarController.ts` **(Lines 47-141)**
- **Save Operation**: `saveCalendarData` handles full bi-directional diffing.
  - _Location_: `server/src/controllers/calendarController.ts` **(Lines 143-357)**

#### **B. Advanced Sync Patterns**

- **Retry Mechanism**: `executeWithRetry` handles API rate limits using exponential backoff.
  - _Location_: `server/src/controllers/calendarController.ts` **(Lines 208-222)**
- **Entity Mapping**: Logic that maps multi-day "Ranges" to Google **All-Day Events**.
  - _Location_: `server/src/controllers/calendarController.ts` **(Lines 318-319)**

---

### 3. Global Notification System (Toast Service)

A non-blocking notification system using the **Singleton Provider Pattern**.

#### **A. Infrastructure**

- **ToastProvider & useToast**: Root context provider and custom consumer hook.
  - _Location_: `client/src/components/ToastProvider.tsx` **(Lines 22-79)**

#### **B. Integration Points**

- **Kanban Board**: Triggers success/error feedback during task lifecycle.
  - _Hook Usage_: `client/src/components/Kanban.tsx` **(Line 509)**
  - _Action Trigger_: `client/src/components/Kanban.tsx` **(Lines 651, 699, 734)**
- **User Dashboard**: Dispatches notifications for authentication and system events.
  - _Hook Usage_: `client/src/pages/users/userDashboard.tsx` **(Line 21)**
  - _Action Trigger_: `client/src/pages/users/userDashboard.tsx` **(Line 109)**

---

### 4. Component Structure Summary

| Feature           | Core Files                               | Primary Technologies               |
| :---------------- | :--------------------------------------- | :--------------------------------- |
| **Calendar UI**   | `CalendarViews.tsx`, `calendar-utils.ts` | React, Framer Motion, date-fns     |
| **Sync Engine**   | `calendarController.ts`                  | Node.js, Googleapis, MongoDB       |
| **Notifications** | `ToastProvider.tsx`                      | React Context API, CSS Transitions |

---

### **Executive Summary (The "Short Form" Description)**

If you need to explain how this system works in a few sentences, here is the concise breakdown:

1.  **Calendar System**: A custom-built React engine that uses a unified **42-day grid** for consistency across months. It handles complex Date Ranges by calculating week-by-week visual "bars" using a suite of temporal utilities (`date-fns`).
2.  **Google Sync Engine**: A robust **bi-directional bridge** on the backend. When you "Read," it reconciles local data by removing orphaned events; when you "Save," it performs an **upsert-and-diff** operation (Create/Update/Delete) against the Google API, utilizing **exponential backoff** to ensure reliability under rate limits.
3.  **Notification Architecture**: A centralized **Singleton Provider** that injects non-blocking feedback (Toasts) across the entire application (Kanban, Dashboard, etc.) via a custom React hook, ensuring a consistent user experience for all system events.
