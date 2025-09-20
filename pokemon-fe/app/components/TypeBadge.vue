<template>
  <span
    class="inline-flex items-center rounded-full border px-2 py-0.5 text-xs capitalize"
    :class="colorClass(type)"
  >
    {{ type }}
  </span>
</template>

<script setup>
const props = defineProps({ type: { type: String, required: true } });
const colorClass = (t) => {
  const key = String(t || "").toLowerCase();

  const map = {
    normal: "border-slate-300 bg-slate-50 text-slate-700",
    fighting: "border-red-300 bg-red-50 text-red-700",
    flying: "border-sky-300 bg-sky-50 text-sky-700",
    poison: "border-fuchsia-300 bg-fuchsia-50 text-fuchsia-700",
    ground: "border-primary-300 bg-primary-50 text-primary-700",
    rock: "border-stone-300 bg-stone-50 text-stone-700",
    bug: "border-lime-300 bg-lime-50 text-lime-700",
    ghost: "border-purple-300 bg-purple-50 text-purple-700",
    steel: "border-zinc-300 bg-zinc-50 text-zinc-700",
    fire: "border-orange-300 bg-orange-50 text-orange-700",
    water: "border-blue-300 bg-blue-50 text-blue-700",
    grass: "border-emerald-300 bg-emerald-50 text-emerald-700",
    electric: "border-amber-300 bg-amber-50 text-amber-700",
    psychic: "border-violet-300 bg-violet-50 text-violet-700",
    ice: "border-cyan-300 bg-cyan-50 text-cyan-700",
    dragon: "border-primary-300 bg-primary-50 text-primary-700",
    dark: "border-neutral-300 bg-neutral-50 text-neutral-700",
    fairy: "border-pink-300 bg-pink-50 text-pink-700",
    stellar: "border-teal-300 bg-teal-50 text-teal-700",
    unknown: "border-gray-300 bg-gray-50 text-gray-700",
  };

  return map[key] || "border-slate-300 bg-slate-50 text-slate-700";
};
</script>
