/**
 * PokeAPI data layer (single source of truth for pages/components).
 * - Centralizes all PokeAPI calls; pages never call $fetch directly.
 * - Exposes: search(), types (shared), and usePokemon(keyRef) for detail pages.
 * - Caches across pages via useState: types, all names, names-by-type, and details.
 *
 * Usage:
 * const { results, count, loading, error, search, types, usePokemon } = usePokeApi();
 * await search({ q: 'char', page: 1, pageSize: 24, types: ['fire'] });
 *
 * // Detail page:
 * const { loading, error, pokemon } = usePokemon(computed(() => route.params.name));
 */

export const usePokeApi = () => {
  const config = useRuntimeConfig();
  const pokeBase = config.public.pokeBase; // e.g. https://pokeapi.co/api/v2

  // Shared list/search state
  const loading = ref(false);
  const error = ref(null);
  const results = ref([]);
  const count = ref(0);

  // Types cache (shared across pages)
  const types = useState("__poke_types__", () => []);
  const typesLoaded = useState("__poke_types_loaded__", () => false);

  // Global lightweight caches
  const allNamesCache = useState("__poke_all_names__", () => null); // string[] | null
  const typeNamesCache = useState("__poke_type_names__", () => ({})); // { [type]: string[] }
  const detailCache = useState("__poke_detail__", () => ({})); // { [key]: mappedPokemon }

  // ---- Internal HTTP helper (single door to PokeAPI) ----
  const pokeGet = async (path, query) => {
    const opts = { baseURL: pokeBase };
    if (query) opts.query = query;
    return await $fetch(path, opts);
  };

  // ---- Mapping helpers ----
  const toCard = (p) => ({
    id: p.id,
    name: p.name,
    sprite:
      p.sprites?.other?.["showdown"]?.front_default || p.sprites?.front_default,
    types: p.types?.map((t) => t.type.name) || [],
  });

  // Human-friendly label for stats
  const formatStatName = (n) => {
    if (!n) return "";
    if (String(n).toLowerCase() === "hp") return "HP";
    // Replace dashes with spaces and Title Case
    return String(n)
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const mapPokemon = (p) => ({
    id: p.id,
    name: p.name,
    sprite:
      p.sprites?.other?.["showdown"]?.front_default || p.sprites?.front_default,
    types: p.types?.map((t) => t.type.name) || [],
    height: p.height ?? 0, // decimeters
    weight: p.weight ?? 0, // hectograms
    abilities: (p.abilities || []).map((a) => a.ability.name),
    stats: (p.stats || []).map((s) => ({
      name: formatStatName(s.stat.name),
      value: s.base_stat,
    })),
    moves: (p.moves || []).map((m) => m.move.name),
  });

  // ---- PokeAPI helpers ----
  const fetchExact = async (key) =>
    pokeGet(`/pokemon/${String(key).toLowerCase()}`);

  const loadTypes = async () => {
    if (typesLoaded.value && types.value.length) return types.value;
    try {
      const data = await pokeGet("/type");
      const list = (data?.results || [])
        .map((t) => t.name)
        .filter((n) => !["unknown", "shadow"].includes(n))
        .sort();
      types.value = list;
    } finally {
      typesLoaded.value = true;
    }
    return types.value;
  };

  const fetchAllNames = async () => {
    if (allNamesCache.value) return allNamesCache.value;
    const list = await pokeGet("/pokemon", { limit: 100000, offset: 0 });
    allNamesCache.value = (list?.results || []).map((x) => x.name);
    return allNamesCache.value;
  };

  const fetchNamesByType = async (type) => {
    if (typeNamesCache.value[type]) return typeNamesCache.value[type];
    const data = await pokeGet(`/type/${type}`);
    const names = (data?.pokemon || []).map((x) => x.pokemon.name);
    typeNamesCache.value[type] = names;
    return names;
  };

  const fuzzyMany = async (q) => {
    const names = await fetchAllNames();
    const s = String(q).toLowerCase();
    let list = names.filter((n) => n.startsWith(s));
    if (!list.length) list = names.filter((n) => n.includes(s));
    return list;
  };

  const listDefault = async (offset = 0, limit = 24) => {
    const list = await pokeGet("/pokemon", { offset, limit });
    // Fetch details by name to avoid cross-origin absolute URLs
    const details = await Promise.all(
      (list?.results || []).map((item) => pokeGet(`/pokemon/${item.name}`))
    );
    return { total: list?.count || 0, details };
  };

  // ---- Public: search with optional query/types filters & pagination ----
  const search = async ({
    q = "",
    page = 1,
    pageSize = 24,
    types: filterTypes = [],
  } = {}) => {
    loading.value = true;
    error.value = null;
    results.value = [];

    try {
      if (!typesLoaded.value) await loadTypes();

      const hasQuery = !!q;
      const hasTypes = !!(filterTypes && filterTypes.length);
      let namePool = null; // null => use default listing

      // Types intersection
      if (hasTypes) {
        const sets = await Promise.all(
          filterTypes.map((t) => fetchNamesByType(t))
        );
        let names = sets[0] || [];
        for (let i = 1; i < sets.length; i++) {
          const s = new Set(sets[i]);
          names = names.filter((n) => s.has(n));
        }
        namePool = names;
      }

      // Query filter
      if (hasQuery) {
        const key = String(q).toLowerCase();
        const isNumeric = /^\d+$/.test(key);

        if (isNumeric) {
          try {
            const p = await fetchExact(key);
            namePool = namePool
              ? namePool.includes(p.name)
                ? [p.name]
                : []
              : [p.name];
          } catch {
            namePool = [];
          }
        } else {
          const all = await fetchAllNames();
          if (all.includes(key)) {
            namePool = namePool ? (namePool.includes(key) ? [key] : []) : [key];
          } else {
            const fuzzy = await fuzzyMany(key);
            namePool = namePool
              ? namePool.filter((n) => fuzzy.includes(n))
              : fuzzy;
          }
        }
      }

      // If we have a pool: local paginate then fetch details
      if (namePool) {
        count.value = namePool.length;
        const start = (page - 1) * pageSize;
        const slice = namePool.slice(start, start + pageSize);
        const details = await Promise.all(
          slice.map((n) => pokeGet(`/pokemon/${n}`))
        );
        results.value = details.map(toCard);
        return;
      }

      // Default listing (no filters)
      const offset = (page - 1) * pageSize;
      const { total, details } = await listDefault(offset, pageSize);
      count.value = total;
      results.value = details.map(toCard);
    } catch (e) {
      error.value = e?.message || "failed";
      results.value = [];
      count.value = 0;
    } finally {
      loading.value = false;
    }
  };

  // ---- Public: detail helpers ----
  const getPokemon = async (key) => {
    const k = String(key).toLowerCase();
    if (detailCache.value[k]) return detailCache.value[k];
    const raw = await fetchExact(k);
    const mapped = mapPokemon(raw);
    detailCache.value[k] = mapped;
    return mapped;
  };

  /**
   * Reactive detail loader that auto-fetches when keyRef changes.
   * Example:
   * const { loading, error, pokemon, reload } = usePokemon(computed(() => route.params.name));
   */
  const usePokemon = (keyRef) => {
    const detailLoading = ref(true);
    const detailError = ref(null);
    const pokemon = ref(null);

    const load = async (k) => {
      if (k === undefined || k === null || k === "") return;
      detailLoading.value = true;
      detailError.value = null;
      pokemon.value = null;
      try {
        pokemon.value = await getPokemon(k);
      } catch {
        detailError.value = "Not found";
      } finally {
        detailLoading.value = false;
      }
    };

    if (isRef(keyRef)) {
      watch(keyRef, (v) => load(v), { immediate: true });
    } else {
      load(keyRef);
    }

    return {
      loading: detailLoading,
      error: detailError,
      pokemon,
      reload: () => load(isRef(keyRef) ? keyRef.value : keyRef),
    };
  };

  return {
    // list/search
    results,
    count,
    loading,
    error,
    search,
    types,

    // detail
    getPokemon,
    usePokemon,
  };
};
