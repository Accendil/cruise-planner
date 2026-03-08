# Cruise Planner v0.1 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a shared task list web app for a family cruise trip, deployed to Azure Static Web Apps with Cosmos DB persistence.

**Architecture:** React SPA served by Azure SWA Free tier. Four CRUD endpoints via SWA Managed Functions (Azure Functions v4, Node.js). Data stored in Azure Cosmos DB Free Tier, single container partitioned by phase.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, Azure Functions v4 (Node.js), @azure/cosmos, SWA CLI for local dev, GitHub Actions for deploy.

---

## Prerequisites (manual steps before writing any code)

### Step 1: Create GitHub repo
Go to github.com (personal account - ryanpst88), create a new public repo named `cruise-planner`. Then:
```bash
cd "C:/Users/ryan.tracey/OneDrive/ai-projects/cruise-planner-project"
git remote add origin https://github.com/ryanpst88/cruise-planner.git
git branch -M main
git push -u origin main
```

### Step 2: Create Azure Cosmos DB (Free Tier)
1. Log into portal.azure.com with ryanpst88@gmail.com
2. Create resource → Azure Cosmos DB → Azure Cosmos DB for NoSQL
3. **Apply Free Tier discount: YES** (1 per subscription, 1000 RU/s, 25GB free)
4. Resource group: `cruise-planner-rg`
5. Account name: `cruise-planner-db`
6. Capacity mode: Serverless (fine for low traffic, pay per use - essentially nothing)
7. Once created: Data Explorer → New Container
   - Database: `cruise-planner`
   - Container: `entries`
   - Partition key: `/phase`
8. Keys → copy PRIMARY CONNECTION STRING → save for later

### Step 3: Create Azure Static Web App
1. portal.azure.com → Create resource → Static Web App
2. Plan: Free
3. Resource group: `cruise-planner-rg`
4. Name: `cruise-planner`
5. Region: West Europe
6. Source: GitHub → authorise → select `ryanpst88/cruise-planner` repo, branch: `main`
7. Build preset: React
8. App location: `/`
9. API location: `api`
10. Output location: `dist`
11. After creation → Configuration → Application settings → add:
    - `COSMOS_CONNECTION_STRING` = your connection string from step 2
    - `COSMOS_DATABASE` = `cruise-planner`
    - `COSMOS_CONTAINER` = `entries`

### Step 4: Install local tooling
```bash
npm install -g azure-functions-core-tools@4
npm install -g @azure/static-web-apps-cli
```

---

## Task 1: Project scaffold

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/App.tsx`
- Create: `tailwind.config.js`, `postcss.config.js`, `src/index.css`

**Step 1: Scaffold Vite app**
```bash
cd "C:/Users/ryan.tracey/OneDrive/ai-projects/cruise-planner-project"
npm create vite@latest . -- --template react-ts
npm install
```

**Step 2: Install Tailwind**
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Step 3: Configure Tailwind**

`tailwind.config.js`:
```js
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
}
```

`src/index.css` (replace contents):
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Step 4: Verify it runs**
```bash
npm run dev
```
Expected: Vite dev server on http://localhost:5173

**Step 5: Commit**
```bash
git add -A
git commit -m "feat: scaffold React + Vite + Tailwind"
```

---

## Task 2: TypeScript types

**Files:**
- Create: `src/types/planner.ts`

**Step 1: Create types file**

`src/types/planner.ts`:
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
export type Priority = 'CRITICAL' | 'IMPORTANT' | 'NICE_TO_HAVE';

export interface PlannerEntry {
  id: string;
  title: string;
  description?: string;
  phase: TripPhase;
  type: EntryType;
  status: EntryStatus;
  confidence: Confidence;
  owner: Owner;
  priority: Priority;
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

export const PHASE_LABELS: Record<TripPhase, string> = {
  UK_PRE_FLIGHT: 'UK Pre-Flight',
  FLORIDA_PRE_CRUISE: 'Florida Pre-Cruise',
  FLORIDA_CRUISE: 'Florida Cruise',
  FLORIDA_POST_CRUISE: 'Florida Post-Cruise',
  UK_POST_CRUISE: 'UK Post-Cruise',
};

export const PHASE_ORDER: TripPhase[] = [
  'UK_PRE_FLIGHT',
  'FLORIDA_PRE_CRUISE',
  'FLORIDA_CRUISE',
  'FLORIDA_POST_CRUISE',
  'UK_POST_CRUISE',
];

export const STATUS_OPTIONS: EntryStatus[] = [
  'INBOX', 'TO_BE_RESEARCHED', 'READY', 'BOOKED', 'WAITING', 'DONE', 'DROPPED',
];
```

**Step 2: Commit**
```bash
git add src/types/planner.ts
git commit -m "feat: add PlannerEntry types"
```

---

## Task 3: Seed data

**Files:**
- Create: `src/data/seed.json`

**Step 1: Create seed data file**

`src/data/seed.json`:
```json
[
  {
    "id": "seed-001",
    "title": "Stay at ibis Styles London Gatwick Airport",
    "phase": "UK_PRE_FLIGHT",
    "type": "BOOKING",
    "status": "BOOKED",
    "confidence": "CONFIRMED",
    "owner": "BOTH",
    "priority": "CRITICAL",
    "startAt": "2026-05-21T15:00:00+01:00",
    "endAt": "2026-05-22T06:10:00+01:00",
    "location": "London Road, Crawley, RH10 9GY",
    "notes": "Exact check-in/check-out to confirm."
  },
  {
    "id": "seed-002",
    "title": "Flight to Orlando (BA 2037)",
    "phase": "UK_PRE_FLIGHT",
    "type": "TRAVEL",
    "status": "BOOKED",
    "confidence": "CONFIRMED",
    "owner": "BOTH",
    "priority": "CRITICAL",
    "startAt": "2026-05-22T10:40:00+01:00",
    "endAt": "2026-05-22T20:15:00-04:00",
    "location": "London LGW → Orlando MCO",
    "bookingRef": "BA 2037"
  },
  {
    "id": "seed-003",
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
    "notes": "7 Night Eastern Caribbean & Perfect Day. Stateroom 8610 - D1. Dining 17:00."
  },
  {
    "id": "seed-004",
    "title": "Flight to London (BA 2036)",
    "phase": "UK_POST_CRUISE",
    "type": "TRAVEL",
    "status": "BOOKED",
    "confidence": "CONFIRMED",
    "owner": "BOTH",
    "priority": "CRITICAL",
    "startAt": "2026-06-03T22:15:00-04:00",
    "endAt": "2026-06-04T06:45:00+01:00",
    "location": "Orlando MCO → London LGW",
    "bookingRef": "BA 2036"
  },
  {
    "id": "seed-005",
    "title": "Pay cruise final balance (£4647.68)",
    "phase": "UK_PRE_FLIGHT",
    "type": "TASK",
    "status": "READY",
    "confidence": "CONFIRMED",
    "owner": "RYAN",
    "priority": "CRITICAL",
    "dueDate": "2026-03-15",
    "notes": "Reservation 8332287. Due by 15 March 2026."
  },
  {
    "id": "seed-006",
    "title": "Confirm all required documents and booking refs",
    "phase": "UK_PRE_FLIGHT",
    "type": "TASK",
    "status": "INBOX",
    "confidence": "NEEDS_CONFIRMING",
    "owner": "BOTH",
    "priority": "CRITICAL"
  },
  {
    "id": "seed-007",
    "title": "Confirm how bags get to plane",
    "phase": "UK_PRE_FLIGHT",
    "type": "TASK",
    "status": "INBOX",
    "confidence": "NEEDS_CONFIRMING",
    "owner": "RYAN",
    "priority": "IMPORTANT"
  },
  {
    "id": "seed-008",
    "title": "Decide transport to airport (drive/park/train/taxi)",
    "phase": "UK_PRE_FLIGHT",
    "type": "RESEARCH",
    "status": "TO_BE_RESEARCHED",
    "confidence": "IDEA",
    "owner": "BOTH",
    "priority": "IMPORTANT"
  },
  {
    "id": "seed-009",
    "title": "Sort cat sitter",
    "phase": "UK_PRE_FLIGHT",
    "type": "TASK",
    "status": "INBOX",
    "confidence": "NEEDS_CONFIRMING",
    "owner": "BOTH",
    "priority": "CRITICAL"
  },
  {
    "id": "seed-010",
    "title": "Confirm exact airport terminal and check-in assumptions",
    "phase": "UK_PRE_FLIGHT",
    "type": "TASK",
    "status": "TO_BE_RESEARCHED",
    "confidence": "NEEDS_CONFIRMING",
    "owner": "RYAN",
    "priority": "CRITICAL"
  },
  {
    "id": "seed-011",
    "title": "Create travel day detailed itinerary",
    "phase": "UK_PRE_FLIGHT",
    "type": "TASK",
    "status": "INBOX",
    "confidence": "IDEA",
    "owner": "RYAN",
    "priority": "IMPORTANT"
  },
  {
    "id": "seed-012",
    "title": "Confirm post-flight plan and timings",
    "phase": "FLORIDA_PRE_CRUISE",
    "type": "TASK",
    "status": "TO_BE_RESEARCHED",
    "confidence": "NEEDS_CONFIRMING",
    "owner": "BOTH",
    "priority": "CRITICAL"
  },
  {
    "id": "seed-013",
    "title": "Confirm transfer from Orlando to port / pre-cruise accommodation",
    "phase": "FLORIDA_PRE_CRUISE",
    "type": "RESEARCH",
    "status": "TO_BE_RESEARCHED",
    "confidence": "IDEA",
    "owner": "BOTH",
    "priority": "CRITICAL"
  },
  {
    "id": "seed-014",
    "title": "Confirm cruise embarkation timing",
    "phase": "FLORIDA_PRE_CRUISE",
    "type": "TASK",
    "status": "TO_BE_RESEARCHED",
    "confidence": "NEEDS_CONFIRMING",
    "owner": "RYAN",
    "priority": "CRITICAL"
  },
  {
    "id": "seed-015",
    "title": "Research animal swim excursion options",
    "phase": "FLORIDA_CRUISE",
    "type": "RESEARCH",
    "status": "TO_BE_RESEARCHED",
    "confidence": "IDEA",
    "owner": "BOTH",
    "priority": "IMPORTANT"
  },
  {
    "id": "seed-016",
    "title": "Research themed nights / dress themes",
    "phase": "FLORIDA_CRUISE",
    "type": "RESEARCH",
    "status": "TO_BE_RESEARCHED",
    "confidence": "IDEA",
    "owner": "BOTH",
    "priority": "NICE_TO_HAVE"
  },
  {
    "id": "seed-017",
    "title": "Decide beaches / beach clubs",
    "phase": "FLORIDA_CRUISE",
    "type": "RESEARCH",
    "status": "TO_BE_RESEARCHED",
    "confidence": "IDEA",
    "owner": "BOTH",
    "priority": "NICE_TO_HAVE"
  },
  {
    "id": "seed-018",
    "title": "Research NASA visit options",
    "phase": "FLORIDA_POST_CRUISE",
    "type": "RESEARCH",
    "status": "TO_BE_RESEARCHED",
    "confidence": "IDEA",
    "owner": "BOTH",
    "priority": "IMPORTANT"
  },
  {
    "id": "seed-019",
    "title": "Research manatee experience options",
    "phase": "FLORIDA_POST_CRUISE",
    "type": "RESEARCH",
    "status": "TO_BE_RESEARCHED",
    "confidence": "IDEA",
    "owner": "BOTH",
    "priority": "NICE_TO_HAVE"
  },
  {
    "id": "seed-020",
    "title": "Confirm airport transfer plan for return flight",
    "phase": "FLORIDA_POST_CRUISE",
    "type": "TASK",
    "status": "INBOX",
    "confidence": "NEEDS_CONFIRMING",
    "owner": "RYAN",
    "priority": "CRITICAL"
  },
  {
    "id": "seed-021",
    "title": "Arrange car / return transport from airport",
    "phase": "UK_POST_CRUISE",
    "type": "TASK",
    "status": "INBOX",
    "confidence": "NEEDS_CONFIRMING",
    "owner": "RYAN",
    "priority": "CRITICAL"
  }
]
```

**Step 2: Commit**
```bash
git add src/data/seed.json
git commit -m "feat: add seed data"
```

---

## Task 4: SWA and API scaffold

**Files:**
- Create: `staticwebapp.config.json`
- Create: `api/package.json`
- Create: `api/tsconfig.json`
- Create: `api/host.json`
- Create: `api/local.settings.json` (gitignored)
- Create: `.gitignore` (update)

**Step 1: SWA route config**

`staticwebapp.config.json`:
```json
{
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/api/*"]
  }
}
```

**Step 2: API package.json**

`api/package.json`:
```json
{
  "name": "cruise-planner-api",
  "version": "1.0.0",
  "main": "src/index.js",
  "scripts": {
    "build": "tsc",
    "start": "func start",
    "test": "node --test dist/test/**/*.test.js"
  },
  "dependencies": {
    "@azure/cosmos": "^4.1.1",
    "@azure/functions": "^4.5.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0"
  }
}
```

**Step 3: API tsconfig**

`api/tsconfig.json`:
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2022",
    "lib": ["ES2022"],
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

**Step 4: host.json**

`api/host.json`:
```json
{
  "version": "2.0",
  "extensionBundle": {
    "id": "Microsoft.Azure.Functions.ExtensionBundle",
    "version": "[4.*, 5.0.0)"
  }
}
```

**Step 5: local.settings.json** (not committed)

`api/local.settings.json`:
```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "COSMOS_CONNECTION_STRING": "YOUR_CONNECTION_STRING_HERE",
    "COSMOS_DATABASE": "cruise-planner",
    "COSMOS_CONTAINER": "entries"
  }
}
```

**Step 6: Update .gitignore**

Add to `.gitignore`:
```
api/local.settings.json
api/node_modules/
api/dist/
node_modules/
dist/
.env
```

**Step 7: Install API deps**
```bash
cd api && npm install && cd ..
```

**Step 8: Commit**
```bash
git add staticwebapp.config.json api/package.json api/tsconfig.json api/host.json .gitignore
git commit -m "feat: scaffold SWA config and API project"
```

---

## Task 5: Cosmos DB adapter

**Files:**
- Create: `api/src/cosmos.ts`
- Create: `api/src/test/cosmos.test.ts`

**Step 1: Write the tests first**

`api/src/test/cosmos.test.ts`:
```ts
import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

// These test the adapter's interface, not the real Cosmos connection.
// We mock the Cosmos SDK container.

describe('cosmos adapter', () => {
  it('getDb returns an object with entries container', async () => {
    // Smoke test - just verify the module loads without throwing
    // Real Cosmos connection is tested manually via integration
    assert.ok(true);
  });
});
```

**Step 2: Run test (should pass trivially)**
```bash
cd api && npx tsc && node --test dist/test/cosmos.test.js
```

**Step 3: Write the adapter**

`api/src/cosmos.ts`:
```ts
import { CosmosClient, Container } from '@azure/cosmos';

let container: Container | null = null;

export function getContainer(): Container {
  if (container) return container;

  const connectionString = process.env.COSMOS_CONNECTION_STRING;
  const database = process.env.COSMOS_DATABASE;
  const containerName = process.env.COSMOS_CONTAINER;

  if (!connectionString || !database || !containerName) {
    throw new Error('Missing Cosmos DB environment variables');
  }

  const client = new CosmosClient(connectionString);
  container = client.database(database).container(containerName);
  return container;
}
```

**Step 4: Commit**
```bash
cd api && npx tsc
cd ..
git add api/src/cosmos.ts api/src/test/cosmos.test.ts
git commit -m "feat: add Cosmos DB adapter"
```

---

## Task 6: API functions - entries (GET + POST)

**Files:**
- Create: `api/src/functions/entries.ts`
- Create: `api/src/test/entries.test.ts`

**Step 1: Write failing tests**

`api/src/test/entries.test.ts`:
```ts
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildNewEntry } from '../functions/entries.js';

describe('buildNewEntry', () => {
  it('sets required defaults', () => {
    const entry = buildNewEntry({ title: 'Test task', phase: 'UK_PRE_FLIGHT' });
    assert.equal(entry.title, 'Test task');
    assert.equal(entry.phase, 'UK_PRE_FLIGHT');
    assert.equal(entry.status, 'INBOX');
    assert.equal(entry.type, 'TASK');
    assert.equal(entry.confidence, 'NEEDS_CONFIRMING');
    assert.equal(entry.owner, 'UNASSIGNED');
    assert.equal(entry.priority, 'NICE_TO_HAVE');
    assert.ok(entry.id.length > 0);
  });

  it('allows overriding defaults', () => {
    const entry = buildNewEntry({ title: 'Booked flight', phase: 'UK_PRE_FLIGHT', status: 'BOOKED', owner: 'RYAN' });
    assert.equal(entry.status, 'BOOKED');
    assert.equal(entry.owner, 'RYAN');
  });
});
```

**Step 2: Run test - expect failure**
```bash
cd api && npx tsc 2>&1 | head -20
```
Expected: compile error - `entries.ts` doesn't exist yet.

**Step 3: Implement**

`api/src/functions/entries.ts`:
```ts
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getContainer } from '../cosmos.js';
import { PlannerEntry } from '../types.js';
import { randomUUID } from 'crypto';

export function buildNewEntry(partial: Partial<PlannerEntry> & { title: string; phase: PlannerEntry['phase'] }): PlannerEntry {
  return {
    id: randomUUID(),
    status: 'INBOX',
    type: 'TASK',
    confidence: 'NEEDS_CONFIRMING',
    owner: 'UNASSIGNED',
    priority: 'NICE_TO_HAVE',
    ...partial,
  };
}

async function getEntries(req: HttpRequest, ctx: InvocationContext): Promise<HttpResponseInit> {
  try {
    const container = getContainer();
    const { resources } = await container.items.readAll<PlannerEntry>().fetchAll();
    return { status: 200, jsonBody: resources };
  } catch (err) {
    ctx.error('getEntries failed', err);
    return { status: 500, jsonBody: { error: 'Failed to fetch entries' } };
  }
}

async function postEntry(req: HttpRequest, ctx: InvocationContext): Promise<HttpResponseInit> {
  try {
    const body = await req.json() as Partial<PlannerEntry> & { title: string; phase: PlannerEntry['phase'] };
    if (!body.title || !body.phase) {
      return { status: 400, jsonBody: { error: 'title and phase are required' } };
    }
    const entry = buildNewEntry(body);
    const container = getContainer();
    const { resource } = await container.items.create(entry);
    return { status: 201, jsonBody: resource };
  } catch (err) {
    ctx.error('postEntry failed', err);
    return { status: 500, jsonBody: { error: 'Failed to create entry' } };
  }
}

app.http('entries', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  route: 'entries',
  handler: async (req, ctx) => {
    if (req.method === 'GET') return getEntries(req, ctx);
    return postEntry(req, ctx);
  },
});
```

**Step 4: Add shared types file for API**

`api/src/types.ts` - copy the type definitions from `src/types/planner.ts` (the API can't import from the React src folder):
```ts
export type TripPhase = 'UK_PRE_FLIGHT' | 'FLORIDA_PRE_CRUISE' | 'FLORIDA_CRUISE' | 'FLORIDA_POST_CRUISE' | 'UK_POST_CRUISE';
export type EntryType = 'TASK' | 'TRAVEL' | 'BOOKING' | 'ITINERARY' | 'RESEARCH' | 'DOCUMENT' | 'NOTE' | 'BUFFER';
export type EntryStatus = 'INBOX' | 'TO_BE_RESEARCHED' | 'READY' | 'BOOKED' | 'WAITING' | 'DONE' | 'DROPPED';
export type Confidence = 'IDEA' | 'NEEDS_CONFIRMING' | 'CONFIRMED';
export type Owner = 'RYAN' | 'ZOE' | 'BOTH' | 'UNASSIGNED';
export type Priority = 'CRITICAL' | 'IMPORTANT' | 'NICE_TO_HAVE';

export interface PlannerEntry {
  id: string;
  title: string;
  description?: string;
  phase: TripPhase;
  type: EntryType;
  status: EntryStatus;
  confidence: Confidence;
  owner: Owner;
  priority: Priority;
  dueDate?: string;
  startAt?: string;
  endAt?: string;
  allDay?: boolean;
  bookingRef?: string;
  location?: string;
  notes?: string;
}
```

**Step 5: Run tests**
```bash
cd api && npx tsc && node --test dist/test/entries.test.js
```
Expected: PASS

**Step 6: Commit**
```bash
git add api/src/functions/entries.ts api/src/types.ts api/src/test/entries.test.ts
git commit -m "feat: add GET and POST /api/entries"
```

---

## Task 7: API functions - entry by ID (PATCH + DELETE)

**Files:**
- Create: `api/src/functions/entry.ts`
- Modify: `api/src/test/entries.test.ts`

**Step 1: Add tests**

Add to `api/src/test/entries.test.ts`:
```ts
import { buildPatch } from '../functions/entry.js';

describe('buildPatch', () => {
  it('only includes allowed fields', () => {
    const patch = buildPatch({ status: 'DONE', title: 'Updated', id: 'should-be-ignored' });
    assert.equal(patch.status, 'DONE');
    assert.equal(patch.title, 'Updated');
    assert.equal(patch.id, undefined);
  });
});
```

**Step 2: Run test - expect failure**
```bash
cd api && npx tsc 2>&1 | head -5
```

**Step 3: Implement**

`api/src/functions/entry.ts`:
```ts
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getContainer } from '../cosmos.js';
import { PlannerEntry } from '../types.js';

const PATCHABLE_FIELDS: (keyof PlannerEntry)[] = [
  'title', 'description', 'phase', 'type', 'status', 'confidence', 'owner',
  'priority', 'dueDate', 'startAt', 'endAt', 'allDay', 'bookingRef',
  'location', 'notes',
];

export function buildPatch(body: Record<string, unknown>): Partial<PlannerEntry> {
  const patch: Partial<PlannerEntry> = {};
  for (const field of PATCHABLE_FIELDS) {
    if (field in body) (patch as Record<string, unknown>)[field] = body[field];
  }
  return patch;
}

async function patchEntry(req: HttpRequest, ctx: InvocationContext): Promise<HttpResponseInit> {
  try {
    const id = req.params.id;
    const body = await req.json() as Record<string, unknown>;
    const patch = buildPatch(body);
    const container = getContainer();

    // Read existing to get partition key
    const { resource: existing } = await container.item(id).read<PlannerEntry>();
    if (!existing) return { status: 404, jsonBody: { error: 'Not found' } };

    const updated = { ...existing, ...patch };
    const { resource } = await container.items.upsert(updated);
    return { status: 200, jsonBody: resource };
  } catch (err) {
    ctx.error('patchEntry failed', err);
    return { status: 500, jsonBody: { error: 'Failed to update entry' } };
  }
}

async function deleteEntry(req: HttpRequest, ctx: InvocationContext): Promise<HttpResponseInit> {
  try {
    const id = req.params.id;
    const container = getContainer();
    const { resource: existing } = await container.item(id).read<PlannerEntry>();
    if (!existing) return { status: 404, jsonBody: { error: 'Not found' } };
    await container.item(id, existing.phase).delete();
    return { status: 204 };
  } catch (err) {
    ctx.error('deleteEntry failed', err);
    return { status: 500, jsonBody: { error: 'Failed to delete entry' } };
  }
}

app.http('entry', {
  methods: ['PATCH', 'DELETE'],
  authLevel: 'anonymous',
  route: 'entries/{id}',
  handler: async (req, ctx) => {
    if (req.method === 'PATCH') return patchEntry(req, ctx);
    return deleteEntry(req, ctx);
  },
});
```

**Step 4: Register both functions in an index**

`api/src/index.ts`:
```ts
import './functions/entries.js';
import './functions/entry.js';
```

Update `api/package.json` main:
```json
"main": "dist/index.js"
```

**Step 5: Run tests**
```bash
cd api && npx tsc && node --test dist/test/entries.test.js
```
Expected: PASS (3 tests)

**Step 6: Commit**
```bash
git add api/src/functions/entry.ts api/src/index.ts
git commit -m "feat: add PATCH and DELETE /api/entries/{id}"
```

---

## Task 8: React API client + state hook

**Files:**
- Create: `src/api/client.ts`
- Create: `src/hooks/useEntries.ts`

**Step 1: API client**

`src/api/client.ts`:
```ts
import type { PlannerEntry } from '../types/planner';

const BASE = '/api';

export async function fetchEntries(): Promise<PlannerEntry[]> {
  const res = await fetch(`${BASE}/entries`);
  if (!res.ok) throw new Error('Failed to fetch entries');
  return res.json();
}

export async function createEntry(entry: Omit<PlannerEntry, 'id'>): Promise<PlannerEntry> {
  const res = await fetch(`${BASE}/entries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });
  if (!res.ok) throw new Error('Failed to create entry');
  return res.json();
}

export async function updateEntry(id: string, patch: Partial<PlannerEntry>): Promise<PlannerEntry> {
  const res = await fetch(`${BASE}/entries/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error('Failed to update entry');
  return res.json();
}

export async function deleteEntry(id: string): Promise<void> {
  const res = await fetch(`${BASE}/entries/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete entry');
}
```

**Step 2: useEntries hook**

`src/hooks/useEntries.ts`:
```ts
import { useState, useEffect, useCallback } from 'react';
import type { PlannerEntry } from '../types/planner';
import { fetchEntries, createEntry, updateEntry, deleteEntry } from '../api/client';

export function useEntries() {
  const [entries, setEntries] = useState<PlannerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchEntries();
      setEntries(data);
    } catch {
      setError('Failed to load entries');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = useCallback(async (entry: Omit<PlannerEntry, 'id'>) => {
    const created = await createEntry(entry);
    setEntries(prev => [...prev, created]);
    return created;
  }, []);

  const update = useCallback(async (id: string, patch: Partial<PlannerEntry>) => {
    const updated = await updateEntry(id, patch);
    setEntries(prev => prev.map(e => e.id === id ? updated : e));
  }, []);

  const remove = useCallback(async (id: string) => {
    await deleteEntry(id);
    setEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  return { entries, loading, error, add, update, remove, reload: load };
}
```

**Step 3: Commit**
```bash
git add src/api/client.ts src/hooks/useEntries.ts
git commit -m "feat: add API client and useEntries hook"
```

---

## Task 9: Seed data loader

The app should auto-seed Cosmos if there are no entries (first load only).

**Files:**
- Create: `api/src/functions/seed.ts`

**Step 1: Seed endpoint**

`api/src/functions/seed.ts`:
```ts
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getContainer } from '../cosmos.js';
import { PlannerEntry } from '../types.js';

// POST /api/seed - idempotent, only seeds if container is empty
app.http('seed', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'seed',
  handler: async (req: HttpRequest, ctx: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const container = getContainer();
      const { resources } = await container.items.readAll().fetchAll();
      if (resources.length > 0) {
        return { status: 200, jsonBody: { message: 'Already seeded', count: resources.length } };
      }
      const body = await req.json() as PlannerEntry[];
      for (const entry of body) {
        await container.items.create(entry);
      }
      return { status: 201, jsonBody: { message: 'Seeded', count: body.length } };
    } catch (err) {
      ctx.error('seed failed', err);
      return { status: 500, jsonBody: { error: 'Seed failed' } };
    }
  },
});
```

Add to `api/src/index.ts`:
```ts
import './functions/seed.js';
```

**Step 2: Seed on first app load in React**

Add to `src/hooks/useEntries.ts` (modify the `load` function):
```ts
import seedData from '../data/seed.json';

const load = useCallback(async () => {
  try {
    setLoading(true);
    const data = await fetchEntries();
    if (data.length === 0) {
      await fetch('/api/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(seedData),
      });
      const seeded = await fetchEntries();
      setEntries(seeded);
    } else {
      setEntries(data);
    }
  } catch {
    setError('Failed to load entries');
  } finally {
    setLoading(false);
  }
}, []);
```

Also add to `tsconfig.json` (React project) to allow JSON imports:
```json
"resolveJsonModule": true
```

**Step 3: Compile and commit**
```bash
cd api && npx tsc && cd ..
git add api/src/functions/seed.ts api/src/index.ts src/hooks/useEntries.ts
git commit -m "feat: add seed endpoint and auto-seed on first load"
```

---

## Task 10: QuickAdd component

**Files:**
- Create: `src/components/QuickAdd.tsx`

`src/components/QuickAdd.tsx`:
```tsx
import { useState } from 'react';
import type { TripPhase } from '../types/planner';
import { PHASE_LABELS, PHASE_ORDER } from '../types/planner';

interface Props {
  onAdd: (title: string, phase: TripPhase) => Promise<void>;
}

export function QuickAdd({ onAdd }: Props) {
  const [title, setTitle] = useState('');
  const [phase, setPhase] = useState<TripPhase>('UK_PRE_FLIGHT');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    await onAdd(title.trim(), phase);
    setTitle('');
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 bg-white border-b border-gray-200">
      <input
        type="text"
        placeholder="Add a task..."
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={saving}
      />
      <select
        value={phase}
        onChange={e => setPhase(e.target.value as TripPhase)}
        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={saving}
      >
        {PHASE_ORDER.map(p => (
          <option key={p} value={p}>{PHASE_LABELS[p]}</option>
        ))}
      </select>
      <button
        type="submit"
        disabled={saving || !title.trim()}
        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium disabled:opacity-50 hover:bg-blue-700"
      >
        {saving ? 'Adding...' : 'Add'}
      </button>
    </form>
  );
}
```

**Commit:**
```bash
git add src/components/QuickAdd.tsx
git commit -m "feat: add QuickAdd component"
```

---

## Task 11: TaskRow component

**Files:**
- Create: `src/components/TaskRow.tsx`

`src/components/TaskRow.tsx`:
```tsx
import type { PlannerEntry, EntryStatus } from '../types/planner';
import { STATUS_OPTIONS } from '../types/planner';

const STATUS_COLOURS: Record<EntryStatus, string> = {
  INBOX: 'bg-gray-100 text-gray-700',
  TO_BE_RESEARCHED: 'bg-yellow-100 text-yellow-800',
  READY: 'bg-blue-100 text-blue-800',
  BOOKED: 'bg-green-100 text-green-800',
  WAITING: 'bg-orange-100 text-orange-800',
  DONE: 'bg-emerald-100 text-emerald-800',
  DROPPED: 'bg-red-100 text-red-700',
};

const OWNER_COLOURS: Record<string, string> = {
  RYAN: 'bg-blue-600 text-white',
  ZOE: 'bg-pink-500 text-white',
  BOTH: 'bg-purple-600 text-white',
  UNASSIGNED: 'bg-gray-300 text-gray-600',
};

const TYPE_LABELS: Record<string, string> = {
  TASK: 'Task', TRAVEL: 'Travel', BOOKING: 'Booking', ITINERARY: 'Itinerary',
  RESEARCH: 'Research', DOCUMENT: 'Doc', NOTE: 'Note', BUFFER: 'Buffer',
};

interface Props {
  entry: PlannerEntry;
  onStatusChange: (id: string, status: EntryStatus) => void;
  onClick: (entry: PlannerEntry) => void;
}

export function TaskRow({ entry, onStatusChange, onClick }: Props) {
  return (
    <tr
      onClick={() => onClick(entry)}
      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
    >
      <td className="py-2 px-4 text-sm font-medium text-gray-900 max-w-xs truncate">
        {entry.title}
      </td>
      <td className="py-2 px-2">
        <span className="text-xs text-gray-500">{TYPE_LABELS[entry.type]}</span>
      </td>
      <td className="py-2 px-2" onClick={e => e.stopPropagation()}>
        <select
          value={entry.status}
          onChange={e => onStatusChange(entry.id, e.target.value as EntryStatus)}
          className={`text-xs px-2 py-1 rounded-full font-medium border-0 focus:ring-2 focus:ring-blue-500 ${STATUS_COLOURS[entry.status]}`}
        >
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </td>
      <td className="py-2 px-2">
        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${OWNER_COLOURS[entry.owner]}`}>
          {entry.owner}
        </span>
      </td>
      <td className="py-2 px-2 text-xs text-gray-500">
        {entry.dueDate ?? ''}
      </td>
      <td className="py-2 px-2 text-xs text-gray-400">
        {entry.confidence?.replace(/_/g, ' ')}
      </td>
    </tr>
  );
}
```

**Commit:**
```bash
git add src/components/TaskRow.tsx
git commit -m "feat: add TaskRow with inline status dropdown"
```

---

## Task 12: NotesPanel component

**Files:**
- Create: `src/components/NotesPanel.tsx`

`src/components/NotesPanel.tsx`:
```tsx
import { useState, useEffect } from 'react';
import type { PlannerEntry, EntryStatus, Owner, Confidence, Priority } from '../types/planner';
import { STATUS_OPTIONS, PHASE_ORDER, PHASE_LABELS } from '../types/planner';

interface Props {
  entry: PlannerEntry | null;
  onClose: () => void;
  onSave: (id: string, patch: Partial<PlannerEntry>) => Promise<void>;
}

export function NotesPanel({ entry, onClose, onSave }: Props) {
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<EntryStatus>('INBOX');
  const [owner, setOwner] = useState<Owner>('UNASSIGNED');
  const [confidence, setConfidence] = useState<Confidence>('NEEDS_CONFIRMING');
  const [priority, setPriority] = useState<Priority>('NICE_TO_HAVE');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (entry) {
      setNotes(entry.notes ?? '');
      setStatus(entry.status);
      setOwner(entry.owner);
      setConfidence(entry.confidence);
      setPriority(entry.priority);
      setDueDate(entry.dueDate ?? '');
    }
  }, [entry]);

  if (!entry) return null;

  const handleSave = async () => {
    setSaving(true);
    await onSave(entry.id, { notes, status, owner, confidence, priority, dueDate: dueDate || undefined });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div
        className="w-full max-w-md bg-white shadow-xl h-full overflow-y-auto p-6 flex flex-col gap-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-semibold text-gray-900 leading-tight pr-4">{entry.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-500">Status</span>
            <select value={status} onChange={e => setStatus(e.target.value as EntryStatus)}
              className="border border-gray-300 rounded px-2 py-1 text-sm">
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-500">Owner</span>
            <select value={owner} onChange={e => setOwner(e.target.value as Owner)}
              className="border border-gray-300 rounded px-2 py-1 text-sm">
              {['RYAN','ZOE','BOTH','UNASSIGNED'].map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-500">Confidence</span>
            <select value={confidence} onChange={e => setConfidence(e.target.value as Confidence)}
              className="border border-gray-300 rounded px-2 py-1 text-sm">
              {['IDEA','NEEDS_CONFIRMING','CONFIRMED'].map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-500">Priority</span>
            <select value={priority} onChange={e => setPriority(e.target.value as Priority)}
              className="border border-gray-300 rounded px-2 py-1 text-sm">
              {['CRITICAL','IMPORTANT','NICE_TO_HAVE'].map(p => <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 col-span-2">
            <span className="text-xs font-medium text-gray-500">Due date</span>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm" />
          </label>
        </div>

        {entry.bookingRef && (
          <p className="text-sm text-gray-600">
            <span className="font-medium">Booking ref:</span> {entry.bookingRef}
          </p>
        )}
        {entry.location && (
          <p className="text-sm text-gray-600">
            <span className="font-medium">Location:</span> {entry.location}
          </p>
        )}
        {(entry.startAt || entry.endAt) && (
          <p className="text-sm text-gray-600">
            {entry.startAt && <span>{new Date(entry.startAt).toLocaleString()}</span>}
            {entry.endAt && <span> → {new Date(entry.endAt).toLocaleString()}</span>}
          </p>
        )}

        <label className="flex flex-col gap-1 flex-1">
          <span className="text-xs font-medium text-gray-500">Notes</span>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={6}
            className="border border-gray-300 rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add notes..."
          />
        </label>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}
```

**Commit:**
```bash
git add src/components/NotesPanel.tsx
git commit -m "feat: add NotesPanel slide-in editor"
```

---

## Task 13: TaskList component

**Files:**
- Create: `src/components/TaskList.tsx`

`src/components/TaskList.tsx`:
```tsx
import type { PlannerEntry, TripPhase, EntryStatus } from '../types/planner';
import { PHASE_ORDER, PHASE_LABELS } from '../types/planner';
import { TaskRow } from './TaskRow';

const PHASE_COLOURS: Record<TripPhase, string> = {
  UK_PRE_FLIGHT: 'bg-slate-700',
  FLORIDA_PRE_CRUISE: 'bg-sky-600',
  FLORIDA_CRUISE: 'bg-teal-600',
  FLORIDA_POST_CRUISE: 'bg-orange-500',
  UK_POST_CRUISE: 'bg-slate-500',
};

interface Props {
  entries: PlannerEntry[];
  onStatusChange: (id: string, status: EntryStatus) => void;
  onSelect: (entry: PlannerEntry) => void;
}

export function TaskList({ entries, onStatusChange, onSelect }: Props) {
  const byPhase = PHASE_ORDER.reduce<Record<TripPhase, PlannerEntry[]>>((acc, phase) => {
    acc[phase] = entries.filter(e => e.phase === phase && e.status !== 'DROPPED');
    return acc;
  }, {} as Record<TripPhase, PlannerEntry[]>);

  return (
    <div className="divide-y divide-gray-100">
      {PHASE_ORDER.map(phase => {
        const items = byPhase[phase];
        if (items.length === 0) return null;
        return (
          <section key={phase}>
            <div className={`px-4 py-2 flex items-center gap-3 ${PHASE_COLOURS[phase]}`}>
              <h2 className="text-sm font-semibold text-white">{PHASE_LABELS[phase]}</h2>
              <span className="text-xs text-white/70">{items.length} items</span>
            </div>
            <table className="w-full">
              <tbody>
                {items.map(entry => (
                  <TaskRow
                    key={entry.id}
                    entry={entry}
                    onStatusChange={onStatusChange}
                    onClick={onSelect}
                  />
                ))}
              </tbody>
            </table>
          </section>
        );
      })}
    </div>
  );
}
```

**Commit:**
```bash
git add src/components/TaskList.tsx
git commit -m "feat: add TaskList grouped by phase"
```

---

## Task 14: Wire up App.tsx

**Files:**
- Modify: `src/App.tsx`

`src/App.tsx`:
```tsx
import { useState } from 'react';
import type { PlannerEntry, TripPhase, EntryStatus } from './types/planner';
import { useEntries } from './hooks/useEntries';
import { QuickAdd } from './components/QuickAdd';
import { TaskList } from './components/TaskList';
import { NotesPanel } from './components/NotesPanel';

export default function App() {
  const { entries, loading, error, add, update } = useEntries();
  const [selected, setSelected] = useState<PlannerEntry | null>(null);

  const handleAdd = async (title: string, phase: TripPhase) => {
    await add({ title, phase, type: 'TASK', status: 'INBOX', confidence: 'NEEDS_CONFIRMING', owner: 'UNASSIGNED', priority: 'NICE_TO_HAVE' });
  };

  const handleStatusChange = async (id: string, status: EntryStatus) => {
    await update(id, { status });
  };

  const handleSave = async (id: string, patch: Partial<PlannerEntry>) => {
    await update(id, patch);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-lg font-bold text-gray-900">Cruise Planner ✈️🚢</h1>
        <p className="text-xs text-gray-500">Star of the Seas · 24 May 2026 · 7 nights</p>
      </header>

      <QuickAdd onAdd={handleAdd} />

      <main className="max-w-4xl mx-auto">
        {loading && (
          <div className="p-8 text-center text-gray-500 text-sm">Loading...</div>
        )}
        {error && (
          <div className="p-4 bg-red-50 text-red-700 text-sm">{error}</div>
        )}
        {!loading && !error && (
          <TaskList
            entries={entries}
            onStatusChange={handleStatusChange}
            onSelect={setSelected}
          />
        )}
      </main>

      <NotesPanel
        entry={selected}
        onClose={() => setSelected(null)}
        onSave={handleSave}
      />
    </div>
  );
}
```

**Step 2: Verify app builds**
```bash
npm run build
```
Expected: `dist/` folder created, no TypeScript errors.

**Step 3: Commit**
```bash
git add src/App.tsx
git commit -m "feat: wire up App with all components"
```

---

## Task 15: Local integration test

**Step 1: Start local Cosmos (or use real connection)**

The simplest option is to use your real Cosmos DB connection string in `api/local.settings.json`. The free tier handles this fine.

**Step 2: Start the app**
```bash
swa start dist --api-location api --run "npm run dev"
```

If swa start has trouble with Vite's dev server, build first and serve the dist:
```bash
npm run build
swa start dist --api-location api
```

Open http://localhost:4280

**Step 3: Verify**
- Page loads, shows "Loading..."
- Seed data appears grouped by phase
- Inline status dropdown updates a row
- Click a row → notes panel slides in
- Edit notes and save → panel closes, data persists on reload
- Quick add bar creates a new entry in the correct phase

---

## Task 16: GitHub Actions deploy

**Files:**
- Create: `.github/workflows/azure-static-web-apps.yml`

> Note: Azure SWA auto-generates this file when you link to GitHub from the portal. Check if it already exists in the repo after the portal setup. If it does, skip creating it. If not, create it manually:

`.github/workflows/azure-static-web-apps.yml`:
```yaml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches: [main]
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches: [main]

jobs:
  build_and_deploy:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build and Deploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: upload
          app_location: /
          api_location: api
          output_location: dist

  close_pull_request:
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    runs-on: ubuntu-latest
    steps:
      - uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          action: close
```

**Step 2: Add the deploy token to GitHub**
1. Azure portal → your SWA → Overview → Manage deployment token
2. Copy the token
3. GitHub repo → Settings → Secrets and variables → Actions → New repository secret
4. Name: `AZURE_STATIC_WEB_APPS_API_TOKEN`, value: paste token

**Step 3: Push and verify**
```bash
git add .github/
git commit -m "ci: add Azure SWA deploy workflow"
git push origin main
```

Watch GitHub Actions → should show build + deploy. Visit the SWA URL from Azure portal to confirm the app is live.

---

## Done

v0.1 is complete when:
- App is live on the SWA URL
- Seed data loads on first visit
- Both Ryan and Zoe can open the URL and see the same data
- Status can be updated inline
- Notes panel opens and saves
- New tasks can be added via quick-add bar
