<template>
  <section class="space-y-6">
    <!-- Page Title -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Favorites</h1>
      <button
        @click="load()"
        class="inline-flex items-center gap-2 rounded-xl border px-3 py-2 hover:bg-slate-100"
        title="Reload"
        type="button"
      >
        <Icon name="mdi:reload" class="w-4 h-4" /> Reload
      </button>
    </div>

    <!-- Loading / Error -->
    <div v-if="loading" class="text-slate-500">Loading…</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>

    <!-- Content -->
    <div v-else>
      <EmptyState
        v-if="!items.length"
        title="No favorites yet"
        subtitle="Add Pokemon to favorites from the Pokedex."
      />

      <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <PokemonCard
          v-for="f in items"
          :key="f.id"
          :pokemon="mapFavorite(f)"
          :to="`/pokemon/${f.name}`"
          remove-label="Remove from Favorites"
          @remove="openConfirm(f)"
        />
      </div>
    </div>

    <!-- Confirm remove -->
    <UiModalDelete
      v-model="confirmOpen"
      :title="'Remove favorite?'"
      :message="
        confirmName
          ? `This will remove ${capitalize(confirmName)} from Favorites.`
          : ''
      "
      :name="confirmName"
      confirm-label="Remove"
      @confirm="confirmDelete"
    />

    <!-- Toast -->
    <UiToast :message="toastMsg" :kind="toastErr ? 'error' : 'success'" position="top" />
  </section>
</template>

<script>
// UI
import EmptyState from "~/components/EmptyState.vue";
import PokemonCard from "~/components/PokemonCard.vue";
import UiToast from "~/components/ui/Toast.vue";
import UiModalDelete from "~/components/ui/ModalDelete.vue";

export default {
  components: {
    EmptyState,
    PokemonCard,
    UiToast,
    UiModalDelete,
  },

  setup() {
    // Title
    const { setTitle } = usePageTitle();
    setTitle("Favorites");

    // Local page state
    const loading = ref(true);
    const error = ref(null);
    const items = ref([]); // raw favorite records from internal API

    // Store (single source of truth for favorites/team)
    const { listFavorites, loadFavorites, toggleFav } = usePokeStore();

    /**
     * Load favorites from the server and keep the shared map in sync.
     */
    const load = async () => {
      loading.value = true;
      error.value = null;
      try {
        const arr = await listFavorites(); // [{ id, pokemon_id, name, sprite, types }]
        items.value = Array.isArray(arr) ? arr : [];
        await loadFavorites(); // refresh shared pokemon_id -> record_id map
      } catch (e) {
        error.value = humanizeApiError(e);
      } finally {
        loading.value = false;
      }
    };

    /**
     * Map a favorite record to PokemonCard's expected shape.
     * Favorite record: { id, pokemon_id, name, sprite, types }
     * Card expects:    { id, name, sprite, types[] }
     */
    const mapFavorite = (f) => ({
      id: f.pokemon_id,
      name: f.name,
      sprite: f.sprite,
      types: f.types || [],
    });

    // Confirm modal state
    const confirmOpen = ref(false);
    const confirmName = ref("");
    const selected = ref({ recordId: null, pokemonId: null, name: "" });

    const openConfirm = (f) => {
      confirmName.value = capitalize(f.name);
      selected.value = { recordId: f.id, pokemonId: f.pokemon_id, name: f.name };
      confirmOpen.value = true;
    };

    const confirmDelete = async () => {
      confirmOpen.value = false; // close quickly for snappy UX
      try {
        // Use store's toggleFav to remove (idempotent and updates shared map)
        const payload = {
          id: selected.value.pokemonId,
          name: selected.value.name,
          sprite: "", // not needed for removal branch
          types: [],
        };
        const res = await toggleFav(payload);
        if (res.ok) {
          // Remove from local list by record id
          const rid = selected.value.recordId;
          items.value = items.value.filter((x) => x.id !== rid);
          toast(`Removed ${confirmName.value} from Favorites`);
        } else {
          toast(res.message || "Something went wrong.", true);
        }
      } catch (e) {
        toast(humanizeApiError(e), true);
      } finally {
        selected.value = { recordId: null, pokemonId: null, name: "" };
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

    const capitalize = (s = "") => s.charAt(0).toUpperCase() + s.slice(1);

    onMounted(load);

    return {
      // state
      loading,
      error,
      items,

      // mapping for card
      mapFavorite,

      // confirm modal
      confirmOpen,
      confirmName,
      openConfirm,
      confirmDelete,

      // toast
      toastMsg,
      toastErr,

      // utils
      capitalize,
      load,
    };
  },
};
</script>
