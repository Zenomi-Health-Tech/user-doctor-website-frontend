import api from "./api";

/**
 * Teen activity tracking for the users website.
 * Sends to the same backend endpoints the teen app uses:
 *   POST /users/activity              (section views)
 *   POST /users/mindfulness-sessions  (finished Mindfulness sessions)
 * Fire and forget: a failed call never affects the page.
 */

type Area = "TEST" | "LESSON" | "MINDFULNESS" | "SLEEP" | "REPORT" | "PAGE";

const AREA_BY_PATH: [RegExp, Area][] = [
  [/^\/mindfulness/, "MINDFULNESS"],
  [/^\/sleep-tracker/, "SLEEP"],
  [/^\/results/, "REPORT"],
];

let lastPath = "";

/** One "viewed" event per section the teen opens (repeat views of the same path in a row are ignored). */
export function trackPageView(path: string, title?: string) {
  if (!path || path === lastPath) return;
  lastPath = path;
  const area = AREA_BY_PATH.find(([re]) => re.test(path))?.[1] ?? "PAGE";
  api
    .post("/users/activity", {
      events: [{ source: "WEB", area, action: "viewed", itemKey: path.slice(0, 160), itemTitle: title?.slice(0, 200), at: new Date().toISOString() }],
    })
    .catch(() => {});
}

/** Same call the app makes when a non looping session plays to the end. */
export function trackMindfulnessSession(category: string, trackTitle: string, durationSeconds?: number) {
  const body: Record<string, unknown> = { category, trackTitle };
  if (durationSeconds && isFinite(durationSeconds)) body.durationSeconds = Math.round(durationSeconds);
  api.post("/users/mindfulness-sessions", body).catch(() => {});
}
