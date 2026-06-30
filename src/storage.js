/**
 * Lightweight localStorage-backed storage adapter.
 *
 * Mirrors the shape of the `window.storage` API available inside Claude
 * artifacts (get/set returning { key, value } or null) so the rest of the
 * app's persistence logic didn't need to change when porting out of the
 * artifact sandbox into a real Vite/browser build.
 *
 * Note: the `shared` flag from the original API is not meaningful here
 * (there's no multi-user backend in a static build) and is accepted but
 * ignored.
 */
export const storage = {
  async get(key) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return null;
      return { key, value: raw };
    } catch {
      return null;
    }
  },

  async set(key, value) {
    try {
      localStorage.setItem(key, value);
      return { key, value };
    } catch {
      return null;
    }
  },

  async delete(key) {
    try {
      localStorage.removeItem(key);
      return { key, deleted: true };
    } catch {
      return null;
    }
  },
};
