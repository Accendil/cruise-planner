# Cruise Planner / Holiday Stress-Killer

## Goal
Build a simple but genuinely useful trip-planning tool for Ryan and Zoe that turns one shared source of truth into:

1. a backlog of things to sort out,
2. a countdown / “next up” view,
3. a day-by-day timeline,
4. a fully detailed hourly itinerary,
5. a place to dump half-baked items like “to be researched?”.

The point is not just organisation. The point is lowering stress by making the unknown visible and turning it into clear next actions.

---

## Recommendation
### Preferred route: build it
Use an **Azure Static Web App** with a lightweight front end and optional local/browser storage first.

Why:
- You want a custom mix of **backlog + trip timeline + hourly itinerary + “next up” card**.
- Existing tools can do bits of this, but usually not the whole flow cleanly without premium features or awkward setup.
- Azure Static Web Apps has a **Free plan for hobby/personal projects**, includes SSL and custom domains, and is a clean fit for a small React app. It also supports GitHub/Azure DevOps integration and managed Functions if needed later.
- This is a very AI-buildable app for Claude Code / Codex.

### Existing tools worth copying ideas from
- **ClickUp** is the strongest inspiration for combined task + schedule + timeline behaviour.
- **Trello** has Timeline and Calendar style views, but Timeline is tied to paid tiers rather than being the obvious free choice.
- **Notion** is fine for manual planning, but less ideal for a purpose-built shared holiday tool with custom timeline rendering.

### Final call
Build a **small bespoke web app** rather than forcing yourselves into someone else’s planning model.

---

## Known trip anchors already found
These should be seeded into the first version as real data, not placeholders.

### Cruise booking
- Reservation number: **8332287**
- Ship: **Star of the Seas**
- Sail date: **24 May 2026**
- Itinerary: **7 Night Eastern Caribbean & Perfect Day**
- Stateroom: **8610 - D1**
- Dining selected: **17:00**
- Final balance due: **4647.68**
- Final payment due date: **15 March 2026**

### Calendar anchors
- **21–22 May 2026**: Stay at **ibis Styles London Gatwick Airport**, London Road, Crawley, RH10 9GY
- **22 May 2026 10:40**: Flight to Orlando **BA 2037** from **London LGW**
- **3 June 2026 22:15**: Flight to London **BA 2036** from **Orlando MCO**
- **4 June 2026 06:45**: Arrive back in London

---

## Product vision
A single app where every item can be one or more of the following:
- task
- booking / reference
- date anchor
- travel leg
- activity idea
- research item
- timed itinerary step
- note

The same underlying records should power multiple views automatically.

Example:
A flight record should show up in:
- backlog if details are incomplete,
- countdown if upcoming,
- trip timeline on the correct day,
- hourly itinerary with exact times,
- document checklist if paperwork is still missing.

---

## Core user stories
### Backlog / planning
- As a user, I want to dump rough items quickly without deciding everything up front.
- As a user, I want items marked as **To be researched** so uncertainty is visible instead of stressful.
- As a user, I want to group tasks by trip phase.
- As a user, I want due dates, owners, and status so we know who is doing what.

### Timeline / itinerary
- As a user, I want a simple “Next up” card showing the next important thing.
- As a user, I want a holiday overview timeline across the whole trip.
- As a user, I want a per-day itinerary.
- As a user, I want a detailed hourly step-by-step plan for travel-heavy days.
- As a user, I want optional wiggle-room / buffer blocks shown explicitly.

### Data quality / confidence
- As a user, I want entries tagged as **Confirmed**, **Needs confirming**, or **Idea only**.
- As a user, I want booking references and document requirements attached to the relevant phase.
- As a user, I want to know what is still unknown.

### Shared use
- As a user, I want both of us to update the same plan.
- As a user, I want a dead simple mobile-friendly view while travelling.
- As a user, I want printable / screenshot-friendly daily plans.

---

## MVP scope
### Included in MVP
1. Shared trip with phases
2. Backlog items with status, owner, due date, priority
3. Timeline items with start/end date/time
4. “Next up” widget
5. Trip phase filtering
6. Daily itinerary view
7. Detailed day view with timed steps and buffer blocks
8. Research bucket for unknowns
9. Notes / booking refs / docs per phase
10. Local persistence first, easy upgrade path later

### Excluded from MVP
- Gmail/Google Calendar live sync
- airline/cruise API integration
- notifications
- budgets / spend tracking
- maps / routing
- offline-first PWA polish
- attachment upload

Those can all come after the core stress-killer loop works.

---

## Key design principle
### One source of truth, many views
Do **not** create separate data for backlog and timeline.

Use one unified entry model with flexible fields:
- title
- phase
- type
- status
- confidence
- owner
- due date
- start datetime
- end datetime
- is all-day
- is timed step
- is research item
- booking reference
- documents needed
- notes
- buffer minutes
- parent item
- sort order

Then derive:
- backlog board,
- countdown,
- phase summary,
- day itinerary,
- hourly agenda,
- checklist.

---

## Trip phases to seed
1. **UK Pre-Flight**
2. **Florida Pre-Cruise**
3. **Florida Cruise**
4. **Florida Post-Cruise**
5. **UK Post-Cruise**

---

## Seed backlog from your notes
### UK Pre-Flight
- Confirm all required documents and booking references
- Confirm how bags get to plane
- Decide transport to airport:
  - drive and park
  - train
  - taxi
  - other
- Pay cruise balance by **15 Mar 2026**
- Sort cat sitter
- Decide whether to stay overnight in London area
- Confirm exact airport terminal and check-in assumptions
- Create travel day detailed itinerary

### Florida Pre-Cruise
- Confirm all required documents and booking references
- Confirm exact post-flight plan and timings
- Confirm transfer from Orlando to pre-cruise accommodation / port plan
- Confirm cruise embarkation timing assumptions

### Florida Cruise
- Confirm all required documents and booking references
- Research animal swim excursion options
- Research themed nights / dress themes
- Decide beaches / beach clubs
- Research hotel day pass / private beach access if relevant
- Confirm booked excursions vs ideas

### Florida Post-Cruise
- Confirm all required documents and booking references
- Research best NASA option
- Research best-value short-stay activities
- Research manatee option
- Confirm airport transfer plan for return

### UK Post-Cruise
- Confirm all required documents and booking references
- Get car / confirm return transport
- Drive to Manchester
- Recovery day / home reset plan

---

## Suggested statuses
- Inbox
- To be researched
- Ready
- Booked
- Waiting
- Done
- Dropped

## Suggested confidence values
- Idea only
- Needs confirming
- Confirmed

## Suggested priorities
- Critical
- Important
- Nice to have

---

## Suggested data model
```ts
export type TripPhase =
  | 'UK_PRE_FLIGHT'
  | 'FLORIDA_PRE_CRUISE'
  | 'FLORIDA_CRUISE'
  | 'FLORIDA_POST_CRUISE'
  | 'UK_POST_CRUISE';

export type EntryType =
  | 'TASK'
  | 'TRAVEL'
  | 'BOOKING'
  | 'ITINERARY'
  | 'RESEARCH'
  | 'DOCUMENT'
  | 'NOTE'
  | 'BUFFER';

export type EntryStatus =
  | 'INBOX'
  | 'TO_BE_RESEARCHED'
  | 'READY'
  | 'BOOKED'
  | 'WAITING'
  | 'DONE'
  | 'DROPPED';

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
  dueDate?: string;          // YYYY-MM-DD
  startAt?: string;          // ISO datetime
  endAt?: string;            // ISO datetime
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

## Views to build
### 1. Dashboard
Shows:
- countdown to trip
- next up
- overdue items
- items due this week
- missing confirmations
- today’s itinerary if within trip window

### 2. Backlog board
Grouped by:
- phase
- or status

Card fields:
- title
- owner
- due date
- confidence
- tags

### 3. Timeline overview
A multi-day horizontal trip timeline showing:
- hotel stay
- flights
- cruise block
- post-cruise block
- return journey

### 4. Daily itinerary
For a selected date:
- morning
- midday
- afternoon
- evening
- key bookings
- docs needed

### 5. Detailed hourly agenda
For travel-heavy dates only.
Example style:
- 05:40 Wake up in hotel
- 06:10 Leave hotel
- 06:10–06:40 Taxi to airport
- 06:40–07:40 Wiggle room
- 07:40 Be at airport / bag drop / security
- 10:40 Flight departs

### 6. Research list
A special filtered list of all unknowns and “to be researched” items.

### 7. Phase summary page
Per trip phase:
- tasks
- refs
- docs
- bookings
- unknowns
- notes

---

## UI behaviour ideas
- Colour by phase
- Border/icon by confidence
- Badge for owner
- Explicit grey blocks for buffers / wiggle room
- “Unknown” chips wherever required info is blank
- Mobile-first day view with giant readable timings
- Print/screenshot mode for single day plans

---

## Seed records for first import
```json
[
  {
    "title": "Stay at ibis Styles London Gatwick Airport",
    "phase": "UK_PRE_FLIGHT",
    "type": "BOOKING",
    "status": "BOOKED",
    "confidence": "CONFIRMED",
    "owner": "BOTH",
    "priority": "CRITICAL",
    "startAt": "2026-05-21T15:00:00+01:00",
    "endAt": "2026-05-22T06:10:00+01:00",
    "location": "London Road, Crawley, RH10 9GY, United Kingdom",
    "notes": "Calendar anchor exists. Exact check-in/check-out to confirm."
  },
  {
    "title": "Flight to Orlando (BA 2037)",
    "phase": "UK_PRE_FLIGHT",
    "type": "TRAVEL",
    "status": "BOOKED",
    "confidence": "CONFIRMED",
    "owner": "BOTH",
    "priority": "CRITICAL",
    "startAt": "2026-05-22T10:40:00+01:00",
    "endAt": "2026-05-22T20:15:00+01:00",
    "location": "London LGW",
    "bookingRef": "BA 2037"
  },
  {
    "title": "Cruise: Star of the Seas",
    "phase": "FLORIDA_CRUISE",
    "type": "BOOKING",
    "status": "BOOKED",
    "confidence": "CONFIRMED",
    "owner": "BOTH",
    "priority": "CRITICAL",
    "startAt": "2026-05-24T00:00:00-04:00",
    "endAt": "2026-05-31T00:00:00-04:00",
    "bookingRef": "8332287",
    "notes": "7 Night Eastern Caribbean & Perfect Day; stateroom 8610 - D1; dining 17:00"
  },
  {
    "title": "Flight to London (BA 2036)",
    "phase": "UK_POST_CRUISE",
    "type": "TRAVEL",
    "status": "BOOKED",
    "confidence": "CONFIRMED",
    "owner": "BOTH",
    "priority": "CRITICAL",
    "startAt": "2026-06-03T22:15:00+01:00",
    "endAt": "2026-06-04T06:45:00+01:00",
    "location": "Orlando MCO",
    "bookingRef": "BA 2036"
  },
  {
    "title": "Pay cruise final balance",
    "phase": "UK_PRE_FLIGHT",
    "type": "TASK",
    "status": "READY",
    "confidence": "CONFIRMED",
    "owner": "RYAN",
    "priority": "CRITICAL",
    "dueDate": "2026-03-15",
    "notes": "Final balance due 4647.68 for reservation 8332287"
  }
]
```

---

## Suggested technical approach
### Front end
- React + TypeScript
- Vite
- Tailwind
- Zustand or React Context for app state
- date-fns for date logic
- localStorage for MVP persistence

### Deployment
- GitHub repo
- Azure Static Web App Free plan
- CI/CD from GitHub

### Storage evolution path
#### MVP
- localStorage + seeded JSON

#### V1.1
- simple JSON import/export

#### V1.2
- Azure Table Storage / Cosmos / Supabase / Firebase if syncing becomes necessary

#### V2
- optional auth and shared cloud persistence

---

## Delivery phases
### Phase 0 — foundation
- create repo
- scaffold React app
- create entry model
- add seed data
- deploy hello world to Azure Static Web Apps

### Phase 1 — useful MVP
- backlog list/board
- timeline overview
- next up widget
- phase filters
- add/edit entry drawer
- local persistence

### Phase 2 — stress-killer mode
- day itinerary view
- hourly agenda view
- buffer blocks
- confidence badges
- research list
- print/screenshot mode

### Phase 3 — quality of life
- import/export JSON
- templates for travel day / excursion day / embarkation day
- recurring checklists
- duplicate day plan

### Phase 4 — optional integrations
- Gmail import helper
- Google Calendar import helper
- auto-seed from known bookings

---

## Backlog for Claude / Codex
### Epic 1 — project setup
- Initialise React + TypeScript + Vite app
- Add Tailwind
- Define core types
- Create sample seed data file
- Deploy initial Azure Static Web App

### Epic 2 — data layer
- Build planner entry store
- Implement create/edit/delete entry actions
- Add localStorage persistence
- Add derived selectors for next up / overdue / research / daily agenda

### Epic 3 — dashboard
- Build summary cards
- Build countdown card
- Build next-up widget
- Build overdue / due-soon lists

### Epic 4 — backlog view
- Board/list toggle
- Group by phase/status
- Card badges for owner/status/confidence
- Sorting and filtering

### Epic 5 — timeline view
- Multi-day trip timeline
- Render bookings and travel blocks
- Phase colouring
- Click item to open details

### Epic 6 — itinerary views
- Daily itinerary page
- Hourly agenda page
- Buffer block rendering
- Compact mobile mode
- Print mode

### Epic 7 — entry UX
- Quick add bar
- “To be researched?” quick action
- Rich edit drawer/modal
- Parent/child steps for travel days

### Epic 8 — import/export
- Export full trip JSON
- Import JSON with validation
- Seed reset action

### Epic 9 — polish
- Empty states
- nice icons
- responsive layout
- error handling
- dark mode if wanted

---

## Definition of done for MVP
The app is MVP-complete when:
- both of you can see the whole trip in one place,
- rough ideas can be added in under 10 seconds,
- the next important thing is obvious,
- travel days can be viewed as a detailed hourly plan,
- the same data powers backlog + timeline + itinerary,
- the app is deployed on Azure Static Web Apps and usable on mobile.

---

## Example prompts for Claude Code / Codex
### Prompt 1 — scaffold app
Build a React + TypeScript + Vite app called Cruise Planner. Use Tailwind. Create a clean mobile-friendly UI. The app manages a holiday using one unified entry model that powers backlog, timeline, and itinerary views. Add seed data from a JSON file and persist edits in localStorage.

### Prompt 2 — implement domain model
Create TypeScript types and a simple state store for PlannerEntry records. Include fields for phase, type, status, confidence, owner, due date, startAt, endAt, bookingRef, documents, notes, bufferMinutes, and parentId. Add derived helpers for next upcoming item, overdue tasks, research items, and items grouped by date.

### Prompt 3 — build views
Create these pages/components: Dashboard, Backlog, Timeline Overview, Daily Itinerary, Detailed Day Agenda, and Entry Editor Drawer. All views must derive from the same underlying PlannerEntry dataset.

### Prompt 4 — render travel day agenda
Build a detailed hourly agenda component for a selected date. Render timed steps in chronological order, including explicit buffer blocks. Example entries: wake up, leave hotel, taxi, wiggle room, bag drop, security, boarding, flight departure.

### Prompt 5 — Azure deployment
Add all files needed to deploy this Vite app to Azure Static Web Apps via GitHub Actions. Keep it compatible with the Azure Static Web Apps Free plan.

---

## Practical first itinerary draft to seed
### 21 May 2026
- Travel to Gatwick area
- Check in to ibis Styles London Gatwick Airport
- Evening prep / documents / bags / sleep

### 22 May 2026
- 05:40 Wake up in hotel
- 06:10 Ready to leave hotel
- 06:10–06:40 Taxi or other transfer to airport
- 06:40–07:40 Wiggle room / bag drop / unexpected faff
- 07:40 Be at airport checking in
- 10:40 Flight BA 2037 departs
- 20:15 Flight lands Orlando time assumption needs confirming in local view

### 24 May 2026
- Embarkation day for Star of the Seas

### 3 June 2026
- Return flight BA 2036 departs Orlando at 22:15

### 4 June 2026
- Arrive London 06:45
- Get car / transfer north
- Drive to Manchester
- Collapse dramatically at home

---

## Risks / watch-outs
- Time zones will bite if handled sloppily.
- Distinguish all-day trip blocks from precise timed items.
- Keep data model simple or the MVP will bloat.
- Avoid overengineering sync/auth before the app is genuinely useful.
- Don’t hard-code everything to this one cruise; keep the model reusable.

---

## Opinionated build call
This is exactly the kind of thing AI coding tools are good at:
- small domain,
- clear views,
- obvious data model,
- easy deployment,
- lots of iterative UI refinement.

You do not need a giant architecture here. You need a crisp MVP that removes stress fast.

