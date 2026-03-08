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
export type Owner     = 'RYAN' | 'ZOE' | 'BOTH' | 'UNASSIGNED';
export type Priority  = 'CRITICAL' | 'IMPORTANT' | 'NICE_TO_HAVE';

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

export const PHASE_LABELS: Record<TripPhase, string> = {
  UK_PRE_FLIGHT:        'UK Pre-Flight',
  FLORIDA_PRE_CRUISE:   'Florida Pre-Cruise',
  FLORIDA_CRUISE:       'Florida Cruise',
  FLORIDA_POST_CRUISE:  'Florida Post-Cruise',
  UK_POST_CRUISE:       'UK Post-Cruise',
};

export const PHASE_ORDER: TripPhase[] = [
  'UK_PRE_FLIGHT',
  'FLORIDA_PRE_CRUISE',
  'FLORIDA_CRUISE',
  'FLORIDA_POST_CRUISE',
  'UK_POST_CRUISE',
];

export const PHASE_NUMBERS: Record<TripPhase, string> = {
  UK_PRE_FLIGHT:       '01',
  FLORIDA_PRE_CRUISE:  '02',
  FLORIDA_CRUISE:      '03',
  FLORIDA_POST_CRUISE: '04',
  UK_POST_CRUISE:      '05',
};

export const PHASE_DATES: Record<TripPhase, string> = {
  UK_PRE_FLIGHT:       'Up to 22 May',
  FLORIDA_PRE_CRUISE:  '22–24 May',
  FLORIDA_CRUISE:      '24–31 May',
  FLORIDA_POST_CRUISE: '31 May – 3 Jun',
  UK_POST_CRUISE:      'From 4 Jun',
};

export const STATUS_OPTIONS: EntryStatus[] = [
  'INBOX', 'TO_BE_RESEARCHED', 'READY', 'BOOKED', 'WAITING', 'DONE', 'DROPPED',
];

export const STATUS_LABELS: Record<EntryStatus, string> = {
  INBOX:            'Inbox',
  TO_BE_RESEARCHED: 'Research',
  READY:            'Ready',
  BOOKED:           'Booked',
  WAITING:          'Waiting',
  DONE:             'Done',
  DROPPED:          'Dropped',
};
