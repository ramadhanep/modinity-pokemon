<template>
  <div class="rounded-2xl border bg-white p-8 text-center">
    <h3 class="text-lg font-semibold">{{ title }}</h3>
    <p class="text-slate-600">{{ subtitle }}</p>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: "" },
});
</script>
