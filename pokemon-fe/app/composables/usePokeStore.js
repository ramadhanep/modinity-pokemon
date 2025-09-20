/**
 * Centralized client-side state for Favorites and Team.
 * - Uses useApi() internally so pages/components never touch endpoints.
 * - Exposes list loaders for pages (favorites/team views).
 * - Exposes actions that return normalized results for UI toasts.
 */

import { useApi } from "~/composables/useApi";
import { humanizeApiError } from "~/utils/formatError";

export const usePokeStore = () => {
  const { get, post, del } = useApi();

  // Shared maps across the app: pokemon_id -> record_id
  const favMap = useState("__fav_map__", () => ({}));   // e.g., { 25: "fav_rec_id" }
  const teamMap = useState("__team_map__", () => ({})); // e.g., { 25: "team_rec_id" }

  // -------- Lists for pages (raw records) --------
  // Each record shape (expected from backend):
  // { id, pokemon_id, name, sprite, types }
  const listFavorites = async () => {
    return await get("/api/favorites");
  };

  const listTeam = async () => {
    return await get("/api/team");
  };

  // -------- Sync helpers for the shared maps --------
  const loadFavorites = async () => {
    const arr = await listFavorites();
    for (const k in favMap.value) delete favMap.value[k];
    for (const f of arr) favMap.value[f.pokemon_id] = f.id;
  };

  const loadTeam = async () => {
    const arr = await listTeam();
    for (const k in teamMap.value) delete teamMap.value[k];
    for (const m of arr) teamMap.value[m.pokemon_id] = m.id;
  };

  // -------- Actions --------

  /**
   * Toggle a Pokemon in Favorites.
   * @param {{ id:number, name:string, sprite:string, types:string[] }} p
   * @returns {{ ok:boolean, action?:'added'|'removed', message?:string }}
   */
  const toggleFav = async (p) => {
    try {
      const id = p?.id;
      if (!id) return { ok: false, message: "Invalid Pokemon payload." };

      const existing = favMap.value[id];
      if (existing) {
        await del(`/api/favorites/${existing}`);
        delete favMap.value[id];
        return { ok: true, action: "removed" };
      } else {
        const created = await post("/api/favorites", {
          pokemonId: id,
          name: p.name,
          sprite: p.sprite,
          types: p.types,
        });
        favMap.value[id] = created?.id || true; // fallback when id missing
        return { ok: true, action: "added" };
      }
    } catch (e) {
      return { ok: false, message: humanizeApiError(e) };
    }
  };

  /**
   * Add a Pokemon to the Team (no duplicates).
   * @param {{ id:number, name:string, sprite:string, types:string[] }} p
   * @returns {{ ok:boolean, message?:string }}
   */
  const addToTeam = async (p) => {
    try {
      const id = p?.id;
      if (!id) return { ok: false, message: "Invalid Pokemon payload." };
      if (teamMap.value[id]) return { ok: false, message: "Already in Team" };

      const created = await post("/api/team", {
        pokemonId: id,
        name: p.name,
        sprite: p.sprite,
        types: p.types,
      });
      teamMap.value[id] = created?.id || true;
      return { ok: true };
    } catch (e) {
      return { ok: false, message: humanizeApiError(e) };
    }
  };

  /**
   * Remove a Pokemon from Team using its pokemon_id (if present).
   * @param {number} pokemonId
   * @returns {{ ok:boolean, message?:string }}
   */
  const removeFromTeam = async (pokemonId) => {
    try {
      const recId = teamMap.value[pokemonId];
      if (!recId) return { ok: true }; // nothing to remove
      await del(`/api/team/${recId}`);
      delete teamMap.value[pokemonId];
      return { ok: true };
    } catch (e) {
      return { ok: false, message: humanizeApiError(e) };
    }
  };

  // -------- Derived --------
  const favoritesCount = computed(() => Object.keys(favMap.value).length);
  const teamCount = computed(() => Object.keys(teamMap.value).length);

  return {
    // shared maps
    favMap,
    teamMap,

    // derived counts
    favoritesCount,
    teamCount,

    // raw list loaders for pages
    listFavorites,
    listTeam,

    // map sync helpers
    loadFavorites,
    loadTeam,

    // actions
    toggleFav,
    addToTeam,
    removeFromTeam,
  };
};
