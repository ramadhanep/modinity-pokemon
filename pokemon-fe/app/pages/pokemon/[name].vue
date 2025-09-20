<template>
  <section class="space-y-6">
    <!-- Header / Breadcrumb -->
    <header class="flex items-center justify-between">
      <NuxtLink
        to="/"
        class="inline-flex items-center gap-2 rounded-xl border px-3 py-2 hover:bg-slate-100"
      >
        <Icon name="mdi:arrow-left" class="w-4 h-4" /> Back
      </NuxtLink>
      <span class="text-sm text-slate-500">Pokemon Detail</span>
    </header>

    <!-- Loading / Error -->
    <div v-if="loading" class="text-slate-500">Loading…</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>

    <!-- Content -->
    <div v-else-if="pokemon" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left: Card -->
      <div class="rounded-2xl border bg-white p-6 shadow-sm">
        <div class="flex items-start justify-between gap-2">
          <h1 class="text-2xl font-bold capitalize">{{ pokemon.name }}</h1>
          <span class="text-slate-500">#{{ pokemon.id }}</span>
        </div>

        <div class="mt-4 flex items-center justify-center">
          <img
            :src="pokemon.sprite"
            :alt="pokemon.name"
            class="h-40 w-40 image-pixelated"
            @error="imgFallback"
          />
        </div>

        <div class="mt-4 flex flex-wrap gap-2">
          <TypeBadge v-for="t in pokemon.types" :key="t" :type="t" />
        </div>

        <!-- Actions -->
        <div class="mt-6 grid grid-cols-2 gap-2">
          <!-- Favorite / Unfavorite -->
          <button
            @click="onToggleFav()"
            type="button"
            class="rounded-xl border px-3 py-2 hover:bg-slate-100 inline-flex items-center justify-center gap-2"
          >
            <Icon
              :name="favMap[pokemon.id] ? 'mdi:heart' : 'mdi:heart-outline'"
              class="w-4 h-4"
            />
            {{ favMap[pokemon.id] ? "Unfavorite" : "Add to Favorites" }}
          </button>

          <!-- Team / In Team (disabled) -->
          <button
            @click="onAddToTeam()"
            type="button"
            class="rounded-xl px-3 py-2 text-sm inline-flex items-center justify-center gap-2 text-white hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed"
            :class="teamMap[pokemon.id] ? 'bg-slate-400' : 'bg-primary-600'"
            :disabled="!!teamMap[pokemon.id]"
            :title="teamMap[pokemon.id] ? 'Already in Team' : 'Add to Team'"
          >
            <Icon
              :name="teamMap[pokemon.id] ? 'mdi:check' : 'mdi:plus'"
              class="w-4 h-4"
            />
            {{ teamMap[pokemon.id] ? "In Team" : "Add to Team" }}
          </button>
        </div>

        <!-- Quick facts -->
        <dl class="mt-6 grid grid-cols-2 gap-3 text-sm">
          <div class="rounded-xl bg-slate-50 p-3">
            <dt class="text-slate-500">Height</dt>
            <dd class="font-medium">
              {{ (pokemon.height / 10).toFixed(1) }} m
            </dd>
          </div>
          <div class="rounded-xl bg-slate-50 p-3">
            <dt class="text-slate-500">Weight</dt>
            <dd class="font-medium">
              {{ (pokemon.weight / 10).toFixed(1) }} kg
            </dd>
          </div>
          <div class="rounded-xl bg-slate-50 p-3 col-span-2">
            <dt class="text-slate-500">Abilities</dt>
            <dd class="font-medium capitalize">
              {{ pokemon.abilities.length ? pokemon.abilities.join(", ") : "—" }}
            </dd>
          </div>
        </dl>
      </div>

      <!-- Right: Base Stats + Moves -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Base stats (inline UI bars) -->
        <div class="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 class="text-lg font-semibold mb-4">Base Stats</h2>
          <ul class="space-y-3">
            <li v-for="s in pokemon.stats" :key="s.name">
              <div class="flex items-center justify-between text-sm">
                <span class="capitalize text-slate-600">{{ s.name }}</span>
                <span class="font-mono">{{ s.value }}</span>
              </div>
              <div class="mt-1 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  class="h-full rounded-full bg-primary-500"
                  :style="{ width: statBarWidth(s.value) }"
                />
              </div>
            </li>
          </ul>
        </div>

        <!-- Moves -->
        <div class="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 class="text-lg font-semibold mb-4">Moves</h2>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="m in pokemon.moves.slice(0, 18)"
              :key="m"
              class="rounded-full border px-3 py-1 text-sm capitalize"
            >
              {{ m }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Not found -->
    <EmptyState
      v-else
      title="Pokemon not found"
      subtitle="Check the name or ID in the URL."
    />

    <!-- Toast -->
    <UiToast
      :message="toastMsg"
      :kind="toastErr ? 'error' : 'success'"
      position="top"
    />
  </section>
</template>

<script>
import TypeBadge from "~/components/TypeBadge.vue";
import EmptyState from "~/components/EmptyState.vue";
import UiToast from "~/components/ui/Toast.vue";

export default {
  components: { TypeBadge, EmptyState, UiToast },
  setup() {
    const route = useRoute();

    // Page title: set a fallback first; update when data arrives
    const { setTitle } = usePageTitle();
    setTitle("Pokedex");

    // Reactive Pokemon detail (follows route param changes)
    const { usePokemon } = usePokeApi();
    const { loading, error, pokemon } = usePokemon(computed(() => route.params.name));

    // Shared favorites & team maps/actions
    const { favMap, teamMap, loadFavorites, loadTeam, toggleFav, addToTeam } = usePokeStore();

    // Update title when the Pokemon changes
    watch(
      () => pokemon.value,
      (p) => {
        if (p) {
          setTitle(`#${p.id} ${capitalize(p.name)}`);
        } else {
          setTitle("Pokedex");
        }
      },
      { immediate: true }
    );

    // Ensure favorites/team maps are populated
    onMounted(async () => {
      try {
        await Promise.all([loadFavorites(), loadTeam()]);
      } catch (e) {
        toast(humanizeApiError(e), true);
      }
    });

    // Actions delegate to store
    const onToggleFav = async () => {
      if (!pokemon.value) return;
      const res = await toggleFav(pokemon.value);
      if (res.ok) {
        toast(
          res.action === "removed"
            ? `Removed ${capitalize(pokemon.value.name)} from Favorites`
            : `Added ${capitalize(pokemon.value.name)} to Favorites`
        );
      } else {
        toast(res.message || "Something went wrong.", true);
      }
    };

    const onAddToTeam = async () => {
      if (!pokemon.value) return;
      if (teamMap[pokemon.value.id]) return; // guarded by disabled button anyway
      const res = await addToTeam(pokemon.value);
      if (res.ok) {
        toast(`Added ${capitalize(pokemon.value.name)} to Team`);
      } else {
        toast(res.message || "Something went wrong.", true);
      }
    };

    // Stat bar width helper
    const statBarWidth = (v) => {
      // 180 is a reasonable high cap for most base stats
      const pct = Math.min(100, Math.round((Number(v || 0) / 180) * 100));
      return `${pct}%`;
    };

    // Image fallback to official sprite if showdown sprite fails
    const imgFallback = (e) => {
      if (!pokemon.value) return;
      e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.value.id}.png`;
    };

    // Toast state & helper
    const toastMsg = ref("");
    const toastErr = ref(false);
    let toastTimer = null;
    const toast = (m, isErr = false, ms = 2000) => {
      toastMsg.value = m;
      toastErr.value = isErr;
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(() => (toastMsg.value = ""), ms);
    };

    const capitalize = (s = "") => s.charAt(0).toUpperCase() + s.slice(1);

    return {
      // data
      loading,
      error,
      pokemon,

      // shared maps (for button states)
      favMap,
      teamMap,

      // actions
      onToggleFav,
      onAddToTeam,

      // helpers
      imgFallback,
      statBarWidth,

      // toast
      toastMsg,
      toastErr,
    };
  },
};
</script>

<style scoped>
.image-pixelated {
  image-rendering: pixelated;
}
</style>
