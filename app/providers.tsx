"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { applyAction, type Action } from "@/lib/reducer";
import { normalizeName, uid } from "@/lib/format";
import {
  emptyState,
  type AppState,
  type Idea,
  type Motive,
  type Rsvp,
} from "@/lib/types";

type MotiveInput = Omit<
  Motive,
  "id" | "createdAt" | "rsvps" | "votes" | "suggestions"
>;
type IdeaInput = { title: string; description?: string };

interface AppApi {
  ready: boolean;
  name: string;
  admin: boolean;
  motives: Motive[];
  ideas: Idea[];
  friends: string[];
  setName: (name: string) => void;
  logout: () => void;
  setAdmin: (v: boolean) => void;
  createMotive: (input: MotiveInput) => string;
  updateMotive: (id: string, patch: Partial<Motive>) => void;
  deleteMotive: (id: string) => void;
  rsvp: (id: string, value: Rsvp) => void;
  vote: (id: string, value: number) => void;
  claim: (id: string, itemId: string) => void;
  addSuggestion: (id: string, text: string) => void;
  statusSuggestion: (id: string, suggestionId: string, status: string) => void;
  createIdea: (input: IdeaInput) => string;
  voteIdea: (id: string, value: number) => void;
  addFriend: (name: string) => void;
  removeFriend: (name: string) => void;
}

const Ctx = createContext<AppApi | null>(null);

const POLL_MS = 4000;

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [name, setNameState] = useState("");
  const [admin, setAdminState] = useState(false);
  const [state, setState] = useState<AppState>(emptyState());

  // Number of in-flight mutations; while > 0 we don't let a poll clobber the
  // optimistic local state.
  const pending = useRef(0);

  const pullState = useCallback(async () => {
    try {
      const res = await fetch("/api/state", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as AppState;
      if (pending.current === 0) {
        setState({ ...emptyState(), ...data });
      }
    } catch {
      /* offline / transient – keep showing what we have */
    }
  }, []);

  // Boot: restore local identity, load shared state, then poll for liveness.
  useEffect(() => {
    setNameState(localStorage.getItem("str-name") || "");
    setAdminState(localStorage.getItem("str-admin") === "true");
    pullState().finally(() => setReady(true));
    const t = setInterval(pullState, POLL_MS);
    const onFocus = () => pullState();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(t);
      window.removeEventListener("focus", onFocus);
    };
  }, [pullState]);

  // Optimistically apply locally, then persist to the shared server and
  // reconcile with the authoritative result.
  const dispatch = useCallback(async (action: Action) => {
    setState((s) => applyAction(s, action));
    pending.current += 1;
    try {
      const res = await fetch("/api/mutate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action),
      });
      if (res.ok) {
        const { state: fresh } = (await res.json()) as { state: AppState };
        setState({ ...emptyState(), ...fresh });
      }
    } catch {
      /* keep optimistic state; next poll will reconcile */
    } finally {
      pending.current -= 1;
    }
  }, []);

  const setName = useCallback(
    (raw: string) => {
      const clean = raw.trim().replace(/\s+/g, " ");
      if (!clean) return;
      localStorage.setItem("str-name", clean);
      setNameState(clean);
      dispatch({ type: "addFriend", name: clean });
    },
    [dispatch]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("str-name");
    setNameState("");
  }, []);

  const setAdmin = useCallback((v: boolean) => {
    localStorage.setItem("str-admin", String(v));
    setAdminState(v);
  }, []);

  const createMotive = useCallback(
    (input: MotiveInput) => {
      const motive: Motive = {
        ...input,
        id: uid(),
        createdAt: new Date().toISOString(),
        rsvps: {},
        votes: {},
        suggestions: [],
      };
      dispatch({ type: "createMotive", motive });
      return motive.id;
    },
    [dispatch]
  );

  const createIdea = useCallback(
    (input: IdeaInput) => {
      const idea: Idea = {
        title: input.title,
        description: input.description,
        createdBy: name,
        id: uid(),
        createdAt: new Date().toISOString(),
        votes: {},
        comments: [],
      };
      dispatch({ type: "createIdea", idea });
      return idea.id;
    },
    [dispatch, name]
  );

  const api: AppApi = useMemo(
    () => ({
      ready,
      name,
      admin,
      motives: state.motives,
      ideas: state.ideas,
      friends: state.friends,
      setName,
      logout,
      setAdmin,
      createMotive,
      updateMotive: (id, patch) => dispatch({ type: "updateMotive", id, patch }),
      deleteMotive: (id) => dispatch({ type: "deleteMotive", id }),
      rsvp: (id, value) => dispatch({ type: "rsvp", id, actor: name, value }),
      vote: (id, value) => dispatch({ type: "vote", id, actor: name, value }),
      claim: (id, itemId) => dispatch({ type: "claim", id, itemId, actor: name }),
      addSuggestion: (id, text) =>
        dispatch({
          type: "addSuggestion",
          id,
          suggestion: { id: uid(), userName: name, text, status: "new" },
        }),
      statusSuggestion: (id, suggestionId, status) =>
        dispatch({ type: "statusSuggestion", id, suggestionId, status }),
      createIdea,
      voteIdea: (id, value) => dispatch({ type: "voteIdea", id, actor: name, value }),
      addFriend: (n) => dispatch({ type: "addFriend", name: n }),
      removeFriend: (n) => dispatch({ type: "removeFriend", name: n }),
    }),
    [ready, name, admin, state, setName, logout, setAdmin, createMotive, createIdea, dispatch]
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("Missing provider");
  return ctx;
}

export { normalizeName };
