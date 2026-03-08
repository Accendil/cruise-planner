# Cruise Planner - Design Doc

**Date:** 2026-03-08

---

## Goal

A shared trip-planning web app for Ryan and Zoe. One source of truth for all cruise tasks, bookings and itinerary items. Accessible from any device, editable by both.

---

## Versioning

| Version | Scope |
|---------|-------|
| v0.1 | Task list MVP - this doc |
| v1.0 | Full plan: dashboard, timeline, itinerary views, hourly agenda, research list, phase summary, print mode |
| v1.2 | Telegram daily check-in bot |

---

## Architecture

```
Browser (React SWA)
  └─ /api/* (SWA Managed Functions - Node.js)
       └─ Azure Cosmos DB Free Tier
            └─ container: entries (partition key: /phase)
```

**Hosting:** Azure Static Web Apps Free plan (personal account ryanpst88@gmail.com)
**CI/CD:** GitHub Actions (auto-deploy on push to main)
**Auth:** None - private shared URL, no login required

---

## Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- SWA Managed Functions (Node.js) for API
- Azure Cosmos DB Free Tier for persistence

---

## API - 4 endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/entries | List all entries |
| POST | /api/entries | Create entry |
| PATCH | /api/entries/{id} | Update entry fields |
| DELETE | /api/entries/{id} | Delete entry |

---

## Data Model

Straight from the plan's `PlannerEntry` type:

```ts
export type TripPhase =
  | 'UK_PRE_FLIGHT'
  | 'FLORIDA_PRE_CRUISE'
  | 'FLORIDA_CRUISE'
  | 'FLORIDA_POST_CRUISE'
  | 'UK_POST_CRUISE';

export type EntryType =
  | 'TASK' | 'TRAVEL' | 'BOOKING' | 'ITINERARY'
  | 'RESEARCH' | 'DOCUMENT' | 'NOTE' | 'BUFFER';

export type EntryStatus =
  | 'INBOX' | 'TO_BE_RESEARCHED' | 'READY'
  | 'BOOKED' | 'WAITING' | 'DONE' | 'DROPPED';

export type Confidence = 'IDEA' | 'NEEDS_CONFIRMING' | 'CONFIRMED';
export type Owner = 'RYAN' | 'ZOE' | 'BOTH' | 'UNASSIGNED';

export interface PlannerEntry {
  id: string;
  title: string;
  description?: string;
  phase: TripPhase;
  type: EntryType;
  status: EntryStatus;
  confidence: Confidence;
  owner: Owner;
  priority: 'CRITICAL' | 'IMPORTANT' | 'NICE_TO_HAVE';
  dueDate?: string;
  startAt?: string;
  endAt?: string;
  allDay?: boolean;
  timedStep?: boolean;
  researchItem?: boolean;
  bookingRef?: string;
  documents?: string[];
  location?: string;
  bufferMinutes?: number;
  parentId?: string;
  sortOrder?: number;
  tags?: string[];
  notes?: string;
}
```

---

## v0.1 UI

Single page, no routing required.

**Layout:**
- Quick-add bar at top (title + phase required, rest defaults to INBOX / TASK / UNASSIGNED / NICE_TO_HAVE)
- Task list grouped by phase, phases in trip order
- Each row shows: title, type badge, status dropdown (inline), owner badge, due date, confidence indicator
- Click any row → slide-in notes panel (full notes field, all fields editable)

**Seed data:** Pre-loaded from the plan - 5 confirmed bookings + full backlog across all phases

---

## Seed Data

5 confirmed bookings (BOOKED/CONFIRMED) + all backlog tasks from the plan. See `src/data/seed.json`.

Trip phases in order:
1. UK Pre-Flight
2. Florida Pre-Cruise
3. Florida Cruise
4. Florida Post-Cruise
5. UK Post-Cruise

---

## Out of Scope for v0.1

- Dashboard / countdown widget
- Timeline overview
- Daily itinerary / hourly agenda
- Research list view
- Phase summary pages
- Print mode
- Import/export
- Telegram bot
- Auth
