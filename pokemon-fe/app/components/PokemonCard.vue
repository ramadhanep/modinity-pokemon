<template>
  <div
    class="group rounded-2xl border bg-white p-4 shadow-sm hover:shadow transition"
  >
    <!-- Clickable area → detail page -->
    <NuxtLink :to="to" class="block">
      <div class="flex items-center justify-between gap-2">
        <!-- Types -->
        <div class="flex gap-2">
          <TypeBadge v-for="t in pokemon.types" :key="t" :type="t" />
        </div>

        <!-- Dex number (hidden when remove mode) -->
        <span v-if="!removeLabel" class="text-xs text-slate-500"
          >#{{ pokemon.id }}</span
        >
      </div>

      <!-- Sprite -->
      <div class="mt-2 flex items-center justify-center">
        <img
          :src="pokemon.sprite"
          :alt="pokemon.name"
          class="h-24 w-24 image-pixelated"
        />
      </div>

      <!-- Name -->
      <div class="flex flex-wrap items-center justify-center gap-1">
        <h3 class="font-semibold capitalize">{{ pokemon.name }}</h3>
      </div>
    </NuxtLink>

    <!-- Actions -->
    <div class="mt-4 grid grid-cols-2 gap-2 items-center">
      <!-- Favorite toggle -->
      <button
        v-if="!removeLabel"
        @click.stop="$emit('add-fav', pokemon)"
        type="button"
        class="rounded-xl border px-3 py-2 text-sm hover:bg-slate-100 inline-flex items-center justify-center gap-1"
        :aria-pressed="favorite ? 'true' : 'false'"
      >
        <Icon
          :name="favorite ? 'mdi:heart' : 'mdi:heart-outline'"
          class="w-4 h-4"
        />
        {{ favorite ? "Unfavorite" : "Favorite" }}
      </button>

      <!-- Team: add OR disabled when already in team -->
      <button
        v-if="!removeLabel"
        @click.stop="!teamMember && $emit('add-team', pokemon)"
        type="button"
        :disabled="teamMember"
        class="rounded-xl px-3 py-2 text-sm inline-flex items-center justify-center gap-1 text-white hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed"
        :class="teamMember ? 'bg-slate-400' : 'bg-primary-600'"
        :aria-disabled="teamMember ? 'true' : 'false'"
        :title="teamMember ? 'Already in Team' : 'Add to Team'"
      >
        <Icon :name="teamMember ? 'mdi:check' : 'mdi:plus'" class="w-4 h-4" />
        {{ teamMember ? "In Team" : "Team" }}
      </button>

      <!-- Remove (used in Favorites/Team pages when removeLabel is provided) -->
      <button
        v-else
        @click.stop="$emit('remove')"
        type="button"
        class="col-span-2 rounded-xl bg-rose-600 px-3 py-2 text-sm text-white hover:bg-rose-700 inline-flex items-center justify-center gap-1"
      >
        <Icon name="mdi:trash-can-outline" class="w-4 h-4" />
        {{ removeLabel }}
      </button>
    </div>
  </div>
</template>

<script setup>
// PokemonCard
// - Always navigates to details via NuxtLink
// - Favorite: toggles via parent (heart outline/filled)
// - Team: when already in team, the button is disabled and shows "In Team"
// - When removeLabel is provided (Favorites/Team pages), shows a single "Remove" action

import TypeBadge from "./TypeBadge.vue";

const props = defineProps({
  pokemon: { type: Object, required: true }, // { id, name, sprite, types[] }
  removeLabel: { type: String, default: "" }, // when set, card shows a single "Remove" button
  to: { type: String, default: "" }, // link to details, e.g., `/pokemon/pikachu`
  favorite: { type: Boolean, default: false }, // favorite state for heart icon
  teamMember: { type: Boolean, default: false }, // already in team → disable Team button
});
</script>

<style scoped>
.image-pixelated {
  image-rendering: pixelated;
}
</style>
