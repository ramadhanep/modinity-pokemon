<template>
  <section class="space-y-6">
    <!-- Page Title -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">Team</h1>
        <p class="text-slate-600 text-sm mt-2">Max 6 members. No duplicates.</p>
      </div>
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
        v-if="!members.length"
        title="No team members"
        subtitle="Add Pokemon from the Pokedex page."
      />

      <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <PokemonCard
          v-for="m in members"
          :key="m.id"
          :pokemon="mapMember(m)"
          :to="`/pokemon/${m.name}`"
          remove-label="Remove from Team"
          @remove="openConfirm(m)"
        />
      </div>
    </div>

    <!-- Confirm remove -->
    <UiModalDelete
      v-model="confirmOpen"
      :title="'Remove from team?'"
      :message="
        confirmName
          ? `This will remove ${capitalize(confirmName)} from Team.`
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
    setTitle("Team");

    // Local page state
    const loading = ref(true);
    const error = ref(null);
    const members = ref([]); // raw team records from internal API

    // Store (single source of truth for favorites/team)
    const { listTeam, loadTeam, removeFromTeam } = usePokeStore();

    /**
     * Load team from the server and keep the shared map in sync.
     */
    const load = async () => {
      loading.value = true;
      error.value = null;
      try {
        const arr = await listTeam(); // [{ id, pokemon_id, name, sprite, types }]
        members.value = Array.isArray(arr) ? arr : [];
        await loadTeam(); // refresh shared pokemon_id -> record_id map
      } catch (e) {
        error.value = humanizeApiError(e);
      } finally {
        loading.value = false;
      }
    };

    /**
     * Map a team record to PokemonCard's expected shape.
     * Team record: { id, pokemon_id, name, sprite, types }
     * Card expects: { id, name, sprite, types[] }
     */
    const mapMember = (m) => ({
      id: m.pokemon_id,
      name: m.name,
      sprite: m.sprite,
      types: m.types || [],
    });

    // Confirm modal state
    const confirmOpen = ref(false);
    const confirmName = ref("");
    const selected = ref({ recordId: null, pokemonId: null, name: "" });

    const openConfirm = (m) => {
      confirmName.value = capitalize(m.name);
      selected.value = { recordId: m.id, pokemonId: m.pokemon_id, name: m.name };
      confirmOpen.value = true;
    };

    const confirmDelete = async () => {
      // Close modal first for snappy UX
      confirmOpen.value = false;
      try {
        const res = await removeFromTeam(selected.value.pokemonId);
        if (res.ok) {
          // Remove from local list by record id
          const rid = selected.value.recordId;
          members.value = members.value.filter((x) => x.id !== rid);
          toast(`Removed ${confirmName.value} from Team`);
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
      members,

      // mapping for card
      mapMember,

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
