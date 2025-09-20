<template>
  <section class="space-y-6">
    <HeroSlider />
    <!-- Header -->
    <header class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
      <h1 class="text-2xl font-bold tracking-tight">Pokedex</h1>

      <div class="flex items-center gap-2 ml-auto">
        <button
          class="inline-flex items-center gap-2 rounded-xl border px-3 py-2 hover:bg-slate-100"
          @click="isFilterOpen = true"
          title="Open filters"
          type="button"
        >
          <Icon name="mdi:filter" class="w-4 h-4" /> Filter
        </button>
        <button
          class="inline-flex items-center gap-2 rounded-xl border px-3 py-2 hover:bg-slate-100"
          @click="resetAll"
          title="Reset filters"
          type="button"
        >
          <Icon name="mdi:reload" class="w-4 h-4" /> Reset
        </button>
      </div>
    </header>

    <!-- Load & error -->
    <div v-if="loading" class="text-slate-500">Loading…</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>

    <!-- Content -->
    <div v-else>
      <EmptyState
        v-if="!results.length"
        title="No results"
        subtitle="Open Filter to change the keyword or types, then Apply."
      />

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <PokemonCard
          v-for="p in results"
          :key="p.id"
          :pokemon="p"
          :to="`/pokemon/${p.name}`"
          :favorite="!!favMap[p.id]"
          :team-member="!!teamMap[p.id]"
          @add-fav="toggleFav"
          @add-team="toggleTeam"
        />
      </div>

      <p class="text-slate-600 mt-6" v-if="results.length && count > 0">
        Showing {{ rangeStart }}–{{ rangeEnd }} of {{ count }} results
      </p>

      <div v-if="results.length" class="mt-6">
        <UiPagination
          :page="page"
          :total="count"
          :page-size="pageSize"
          :max-buttons="7"
          @update:page="onPageChange"
        />
      </div>
    </div>

    <!-- Filter sidebar -->
    <FilterPokedex
      v-model="isFilterOpen"
      :types="types"
      :q="q"
      :selected="selectedTypes"
      @update:q="(val) => (q = val)"
      @update:selected="(arr) => (selectedTypes = arr)"
      @apply="onApplyFilter"
    />

    <!-- Toast -->
    <UiToast :message="toastMsg" :kind="toastErr ? 'error' : 'success'" position="top" />
  </section>
</template>

<script>
// UI
import HeroSlider from "~/components/HeroSlider.vue";
import PokemonCard from "~/components/PokemonCard.vue";
import EmptyState from "~/components/EmptyState.vue";
import UiToast from "~/components/ui/Toast.vue";
import UiPagination from "~/components/ui/Pagination.vue";
import FilterPokedex from "~/components/FilterPokedex.vue";

export default {
  components: {
    HeroSlider,
    PokemonCard,
    EmptyState,
    UiToast,
    UiPagination,
    FilterPokedex,
  },

  setup() {
    // Title
    const { setTitle } = usePageTitle();
    setTitle("Pokedex");

    // Pokedex data (search, results, types, pagination state)
    const { results, count, loading, error, search, types } = usePokeApi();

    // Favorites/Team shared state and actions
    const { favMap, teamMap, loadFavorites, loadTeam, toggleFav: toggleFavStore, addToTeam, removeFromTeam } =
      usePokeStore();

    // Query / filters / pagination
    const q = ref("");
    const page = ref(1);
    const pageSize = ref(24);
    const isFilterOpen = ref(false);
    const selectedTypes = ref([]);

    // Execute search with current UI state
    const doSearch = () =>
      search({
        q: q.value,
        page: page.value,
        pageSize: pageSize.value,
        types: selectedTypes.value,
      });

    // Reset all filters and rerun search
    const resetAll = () => {
      q.value = "";
      selectedTypes.value = [];
      page.value = 1;
      doSearch();
    };

    // Apply filters from sidebar
    const onApplyFilter = ({ q: qNew, types }) => {
      q.value = qNew;
      selectedTypes.value = types;
      page.value = 1;
      doSearch();
    };

    // Pagination
    const onPageChange = (p) => {
      page.value = p;
      doSearch();
    };

    // Toggle favorites: delegate to store
    const toggleFav = async (p) => {
      const res = await toggleFavStore(p);
      if (res.ok) {
        toast(
          res.action === "removed"
            ? `Removed ${capitalize(p.name)} from Favorites`
            : `Added ${capitalize(p.name)} to Favorites`
        );
      } else {
        toast(res.message || "Something went wrong.", true);
      }
    };

    // Toggle team: add if not in team, remove if already in team
    const toggleTeam = async (p) => {
      const inTeam = !!teamMap[p.id];
      const res = inTeam ? await removeFromTeam(p.id) : await addToTeam(p);
      if (res.ok) {
        toast(
          inTeam
            ? `Removed ${capitalize(p.name)} from Team`
            : `Added ${capitalize(p.name)} to Team`
        );
      } else {
        toast(res.message || "Something went wrong.", true);
      }
    };

    // Toast helpers
    const toastMsg = ref("");
    const toastErr = ref(false);
    let toastTimer = null;
    const toast = (m, isErr = false, ms = 2000) => {
      toastMsg.value = m;
      toastErr.value = isErr;
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(() => (toastMsg.value = ""), ms);
    };

    // Small helpers
    const capitalize = (s = "") => s.charAt(0).toUpperCase() + s.slice(1);

    const hasFilters = computed(() => !!q.value || selectedTypes.value.length > 0);
    const rangeStart = computed(() => (count.value === 0 ? 0 : (page.value - 1) * pageSize.value + 1));
    const rangeEnd = computed(() => {
      const end = (page.value - 1) * pageSize.value + results.value.length;
      return Math.min(end, count.value);
    });

    // Initial load: sync shared maps, then run initial search
    onMounted(async () => {
      try {
        await Promise.all([loadFavorites(), loadTeam()]);
      } catch (e) {
        // non-blocking toast
        toast(humanizeApiError(e), true);
      } finally {
        await doSearch();
      }
    });

    return {
      // UI state
      hasFilters,
      rangeStart,
      rangeEnd,

      // Pokedex data
      results,
      count,
      loading,
      error,
      q,
      page,
      pageSize,
      selectedTypes,
      isFilterOpen,
      onApplyFilter,
      resetAll,
      onPageChange,
      types,

      // Favorites/Team for cards
      favMap,
      teamMap,
      toggleFav,
      toggleTeam,

      // Toast
      toastMsg,
      toastErr,
    };
  },
};
</script>
