export type Rsvp = "going" | "maybe" | "cant";

export interface BringItem {
  id: string;
  label: string;
  status?: string;
  claimedBy?: string;
  notes?: string;
}

export interface Suggestion {
  id: string;
  userName: string;
  text: string;
  status: string;
}

export interface Motive {
  id: string;
  title: string;
  category: string;
  location: string;
  address?: string;
  date: string;
  startTime: string;
  endTime?: string;
  description?: string;
  rules?: string;
  requirements?: string;
  maxGuests?: number;
  allowPlusOnes?: boolean;
  visibility?: string;
  invitedNames?: string[];
  foodSetup?: string;
  createdBy: string;
  createdAt: string;
  bringItems: BringItem[];
  rsvps: Record<string, Rsvp>;
  votes: Record<string, number>;
  suggestions: Suggestion[];
}

export interface Idea {
  id: string;
  title: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  votes: Record<string, number>;
  comments: { id: string; userName: string; text: string }[];
}

export interface AppState {
  motives: Motive[];
  ideas: Idea[];
  friends: string[];
  /** normalized name -> last-seen timestamp (ms). Drives "Online now". */
  presence: Record<string, number>;
}

export const emptyState = (): AppState => ({
  motives: [],
  ideas: [],
  friends: [],
  presence: {},
});
