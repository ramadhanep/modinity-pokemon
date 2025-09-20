<template>
  <ul class="space-y-3">
    <li v-for="it in items" :key="it.label">
      <div class="flex items-center justify-between text-sm">
        <span class="capitalize text-slate-600">{{ it.label }}</span>
        <span class="font-mono">{{ it.value }}</span>
      </div>
      <div class="mt-1 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
        <div
          class="h-full rounded-full"
          :class="barClass"
          :style="{ width: percent(it) }"
        />
      </div>
    </li>
  </ul>
</template>

<script setup>
// Dumb UI component: render labeled bars.
// No data picking/mapping here; pass shaped items from the page.
const props = defineProps({
  items: { type: Array, required: true }, // [{ label, value, max? }]
  max: { type: Number, default: 180 }, // fallback max if item.max is absent
  color: { type: String, default: "primary" }, // Tailwind color name
});

// Width = value / (item.max || props.max)
const percent = (it) => {
  const cap = Number(it.max ?? props.max);
  const val = Math.max(0, Math.min(Number(it.value || 0), cap));
  return `${Math.round((val / cap) * 100)}%`;
};

// Keep it simple; relies on Tailwind JIT to generate the class
const barClass = computed(() => `bg-${props.color}-500`);
</script>
