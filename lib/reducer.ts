import { normalizeName } from "./format";
import type { AppState, Idea, Motive, Rsvp, Suggestion } from "./types";

/**
 * Every mutation in the app is expressed as one of these actions. The same pure
 * reducer runs on the client (for instant optimistic updates) and on the server
 * (as the source of truth that every other device polls), so what you do shows
 * up on everyone else's screen.
 */
export type Action =
  | { type: "createMotive"; motive: Motive }
  | { type: "updateMotive"; id: string; patch: Partial<Motive> }
  | { type: "deleteMotive"; id: string }
  | { type: "rsvp"; id: string; actor: string; value: Rsvp }
  | { type: "vote"; id: string; actor: string; value: number }
  | { type: "claim"; id: string; itemId: string; actor: string }
  | { type: "addSuggestion"; id: string; suggestion: Suggestion }
  | { type: "statusSuggestion"; id: string; suggestionId: string; status: string }
  | { type: "createIdea"; idea: Idea }
  | { type: "voteIdea"; id: string; actor: string; value: number }
  | { type: "addFriend"; name: string }
  | { type: "removeFriend"; name: string };

const mapMotive = (
  state: AppState,
  id: string,
  fn: (m: Motive) => Motive
): AppState => ({
  ...state,
  motives: state.motives.map((m) => (m.id === id ? fn(m) : m)),
});

export function applyAction(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "createMotive":
      return { ...state, motives: [action.motive, ...state.motives] };

    case "updateMotive":
      return mapMotive(state, action.id, (m) => ({ ...m, ...action.patch }));

    case "deleteMotive":
      return { ...state, motives: state.motives.filter((m) => m.id !== action.id) };

    case "rsvp":
      return mapMotive(state, action.id, (m) => ({
        ...m,
        rsvps: { ...m.rsvps, [normalizeName(action.actor)]: action.value },
      }));

    case "vote":
      return mapMotive(state, action.id, (m) => ({
        ...m,
        votes: { ...m.votes, [normalizeName(action.actor)]: action.value },
      }));

    case "claim":
      return mapMotive(state, action.id, (m) => ({
        ...m,
        bringItems: m.bringItems.map((it) =>
          it.id === action.itemId
            ? {
                ...it,
                claimedBy:
                  it.claimedBy && normalizeName(it.claimedBy) === normalizeName(action.actor)
                    ? undefined
                    : action.actor,
              }
            : it
        ),
      }));

    case "addSuggestion":
      return mapMotive(state, action.id, (m) => ({
        ...m,
        suggestions: [...m.suggestions, action.suggestion],
      }));

    case "statusSuggestion":
      return mapMotive(state, action.id, (m) => ({
        ...m,
        suggestions: m.suggestions.map((s) =>
          s.id === action.suggestionId ? { ...s, status: action.status } : s
        ),
      }));

    case "createIdea":
      return { ...state, ideas: [action.idea, ...state.ideas] };

    case "voteIdea":
      return {
        ...state,
        ideas: state.ideas.map((i) =>
          i.id === action.id
            ? { ...i, votes: { ...i.votes, [normalizeName(action.actor)]: action.value } }
            : i
        ),
      };

    case "addFriend": {
      const name = action.name.trim();
      if (!name) return state;
      const friends = [
        ...state.friends.filter((f) => normalizeName(f) !== normalizeName(name)),
        name,
      ];
      return { ...state, friends };
    }

    case "removeFriend":
      return {
        ...state,
        friends: state.friends.filter(
          (f) => normalizeName(f) !== normalizeName(action.name)
        ),
      };

    default:
      return state;
  }
}
