# buildmoat-calendar

A timezone-aware live session calendar for the BuildMoat 2026 System Design Bootcamp.

## Table of Contents

- [Specifications](#specifications)
- [Tech Stack](#tech-stack)
- [System Design](#system-design)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
- [Component Reference](#component-reference)
- [Out of Scope](#out-of-scope)

---

## Specifications

### Functional Requirements

| # | Requirement |
|---|---|
| F1 | Display a monthly calendar grid for Jan – Jun 2026 |
| F2 | Mark all 8 weekly Live Sessions (Sat 10:00 AM Taipei, May 2 – Jun 20) |
| F3 | Mark one-off events: 直播聊聊 1–3, 實戰營正式開課, 專業分享 EP01 |
| F4 | Support 4 timezones; auto-detect user's browser timezone on load |
| F5 | Shift event markers to the correct local date when timezone changes cross midnight |
| F6 | Show event detail modal on click (name, local date/time, format, recording info) |
| F7 | Collapse/expand month grids; Jan–Mar grouped under a shared toggle |
| F8 | Multi-event days show stacked color-coded chips, each independently clickable |

### Non-Functional Requirements

| # | Requirement |
|---|---|
| N1 | Responsive: 3-col on desktop, 2-col on tablet, 1-col on mobile |
| N2 | All datetime logic in UTC; local display computed on the fly via dayjs-timezone |
| N3 | Static site — no backend, no build-time data fetching |

### Out of Scope

| Feature | Reason |
|---|---|
| Google Calendar / iCal export | Not implemented in this version |
| Event CRUD / admin panel | Read-only calendar |
| Authentication | Public page, no auth needed |
| Server-side rendering | Vite SPA is sufficient |

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Vue 3 (`<script setup>`) | Composition API only |
| Styling | Tailwind CSS v4 (Vite plugin) | Dark theme, custom inline styles for fine-grained RGBA |
| Date handling | dayjs + utc + timezone plugins | All events stored as UTC ISO strings |
| Icons | lucide-vue-next | Minimal icon set |
| Build tool | Vite | Base path `/build-moat-calendar/` for GitHub Pages |
| Package manager | npm | |

---

## System Design

```
┌─────────────────────────────────────────────────────┐
│                      App.vue                        │
│  selectedTimezone (ref)   modalState (ref)          │
│                                                     │
│  ┌──────────────┐   ┌────────────────────────────┐  │
│  │TimezonePicker│   │      CalendarManager       │  │
│  │  (top-right) │   │  Jan–Mar (collapsed group) │  │
│  └──────────────┘   │  Apr–Jun (individual)      │  │
│                     │                            │  │
│                     │  ┌──────────────────────┐  │  │
│                     │  │     MonthGrid ×6     │  │  │
│                     │  │  7-col day cells     │  │  │
│                     │  │  eventMap: date→[]   │  │  │
│                     │  └──────────────────────┘  │  │
│                     └────────────────────────────┘  │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │           EventDetailModal (overlay)        │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### Data Flow

```
events.ts
  LIVE_EVENTS (UTC ISO strings)
       │
       ▼
MonthGrid.cells (computed)
  for each event:
    getEventLocalDatetime(event, timezone) → { date, time }
    dayjs.utc(datetimeUtc).tz(timezone).format('ha') → shortTime
    group by local date → eventMap: Map<string, EventEntry[]>
    sort same-day events by datetimeUtc
       │
       ▼
DayCell[]  ──click──▶  emit('eventClick', event, localDate, localTime)
                                │
                                ▼
                        App.vue openModal()
                                │
                                ▼
                        EventDetailModal
```

### Event Types

| Type | Color | Example |
|---|---|---|
| `live` (default) | Gold `#ffd700` | 實戰營 Live Session 1–8 |
| `kickoff` | White | 實戰營正式開課 |
| `sharing` | Light blue `rgba(100,180,255,…)` | 專業分享 EP01 |
| `isRecord: true` | Gold (dimmed) | 直播聊聊 1–3 |

### Event Schedule

| Event | UTC | Taipei local |
|---|---|---|
| 直播聊聊 1 | 2026-02-01T13:00Z | Feb 1, 9:00 PM |
| 直播聊聊 2 | 2026-02-08T15:00Z | Feb 8, 11:00 PM |
| 直播聊聊 3 | 2026-02-21T01:25Z | Feb 21, 9:25 AM |
| 實戰營正式開課 | 2026-03-14T16:00Z | Mar 15, 12:00 AM |
| Live Session 1 | 2026-05-02T02:00Z | May 2, 10:00 AM |
| Live Session 2 | 2026-05-09T02:00Z | May 9, 10:00 AM |
| Live Session 3 | 2026-05-16T02:00Z | May 16, 10:00 AM |
| 專業分享 EP01 | 2026-05-16T03:00Z | May 16, 11:00 AM |
| Live Session 4 | 2026-05-23T02:00Z | May 23, 10:00 AM |
| Live Session 5 | 2026-05-30T02:00Z | May 30, 10:00 AM |
| Live Session 6 | 2026-06-06T02:00Z | Jun 6, 10:00 AM |
| Live Session 7 | 2026-06-13T02:00Z | Jun 13, 10:00 AM |
| Live Session 8 | 2026-06-20T02:00Z | Jun 20, 10:00 AM |

---

## Folder Structure

```
buildmoat-calendar/
├── src/
│   ├── data/
│   │   └── events.ts          # All event data + timezone utilities
│   ├── components/
│   │   ├── CalendarManager.vue  # Month grid layout + Jan–Mar group toggle
│   │   ├── MonthGrid.vue        # 7-col grid, event mapping, cell rendering
│   │   ├── EventDetailModal.vue # Click-to-open detail overlay
│   │   ├── TimezonePicker.vue   # Dropdown for 4 supported timezones
│   │   └── NextSessionCard.vue  # (Unused in current layout)
│   ├── App.vue                # Root: timezone state, modal state
│   ├── main.ts                # Vue app entry point
│   └── style.css              # Global base styles
├── public/
│   └── .nojekyll              # Disables Jekyll on GitHub Pages
├── index.html
├── vite.config.ts             # Base path: /build-moat-calendar/
├── tsconfig.json
└── package.json
```

---

## Getting Started

**Prerequisites:** Node.js 18+, npm

1. Install dependencies
   ```bash
   npm install
   ```

2. Start dev server
   ```bash
   npm run dev
   ```
   Opens at `http://localhost:5173/build-moat-calendar/`

3. Build for production
   ```bash
   npm run build
   ```
   Output in `dist/`

4. Deploy to GitHub Pages
   ```bash
   git push origin main
   ```
   GitHub Actions workflow handles the deploy automatically.

---

## Component Reference

### `events.ts`

| Export | Type | Description |
|---|---|---|
| `LIVE_EVENTS` | `LiveEvent[]` | All events merged from all event arrays |
| `TIMEZONE_OPTIONS` | `{label, value}[]` | 4 supported timezones |
| `getUserTimezone()` | `() => string` | Returns browser tz if supported, else `Asia/Taipei` |
| `getEventLocalDatetime(event, tz)` | `{date, time}` | Converts UTC event to local `YYYY-MM-DD` / `h:mm A` |

### `LiveEvent` interface

```ts
interface LiveEvent {
  id: number           // Session number (0 for non-series events)
  name: string
  description: string
  datetimeUtc: string  // ISO 8601 UTC
  liveUrl?: string     // YouTube replay URL (isRecord events)
  isRecord?: boolean   // True for past recorded streams
  type?: 'live' | 'kickoff' | 'sharing'  // defaults to live
}
```

### `MonthGrid.vue` props

| Prop | Type | Required | Description |
|---|---|---|---|
| `year` | `number` | ✓ | Year to display |
| `month` | `number` | ✓ | 1-based month |
| `timezone` | `string` | ✓ | IANA timezone string |
| `events` | `LiveEvent[]` | ✓ | Full event list (filtered internally by date) |
| `externalCollapsed` | `boolean` | — | Controlled collapse state |
| `defaultCollapsed` | `boolean` | — | Initial internal collapse state |

---

## Out of Scope

| Feature | Reason |
|---|---|
| Google Calendar / iCal export | Not implemented in this version |
| Backend / API | Static data only |
| Event editing or admin UI | Read-only display |
| Additional timezone options | Only 4 supported timezones |
| SSR / SEO optimization | SPA is sufficient for internal use |
