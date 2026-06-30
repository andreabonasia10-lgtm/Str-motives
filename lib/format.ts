export const normalizeName = (s: string) =>
  (s || "").trim().replace(/\s+/g, " ").toLocaleLowerCase();

export const prettyDate = (d: string) => {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(new Date(`${d}T12:00:00`));
  } catch {
    return d;
  }
};

export const prettyTime = (t: string) => {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  return new Date(2000, 0, 1, h, m).toLocaleTimeString("en-CA", {
    hour: "numeric",
    minute: "2-digit",
  });
};

export const uid = () =>
  (globalThis.crypto?.randomUUID?.() ??
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`);
