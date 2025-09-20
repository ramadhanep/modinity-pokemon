<template>
  <nav
    class="flex items-center justify-center gap-2 select-none"
    aria-label="Pagination"
  >
    <button
      class="px-3 py-1.5 rounded-lg border hover:bg-slate-50 disabled:opacity-40"
      :disabled="page <= 1"
      @click="$emit('update:page', 1)"
      title="First"
    >
      «
    </button>
    <button
      class="px-3 py-1.5 rounded-lg border hover:bg-slate-50 disabled:opacity-40"
      :disabled="page <= 1"
      @click="$emit('update:page', page - 1)"
      title="Prev"
    >
      ‹
    </button>

    <button
      v-for="n in pagesToShow"
      :key="n"
      class="px-3 py-1.5 rounded-lg border"
      :class="
        n === page
          ? 'bg-primary-600 text-white border-primary-600'
          : 'hover:bg-slate-50'
      "
      @click="$emit('update:page', n)"
    >
      {{ n }}
    </button>

    <button
      class="px-3 py-1.5 rounded-lg border hover:bg-slate-50 disabled:opacity-40"
      :disabled="page >= totalPages"
      @click="$emit('update:page', page + 1)"
      title="Next"
    >
      ›
    </button>
    <button
      class="px-3 py-1.5 rounded-lg border hover:bg-slate-50 disabled:opacity-40"
      :disabled="page >= totalPages"
      @click="$emit('update:page', totalPages)"
      title="Last"
    >
      »
    </button>
  </nav>
</template>

<script setup>
const props = defineProps({
  page: { type: Number, required: true },
  total: { type: Number, required: true },
  pageSize: { type: Number, default: 24 },
  maxButtons: { type: Number, default: 7 },
});
const totalPages = computed(() =>
  Math.max(1, Math.ceil(props.total / props.pageSize))
);

const pagesToShow = computed(() => {
  const max = Math.max(3, props.maxButtons);
  const tp = totalPages.value;
  let start = Math.max(1, props.page - Math.floor(max / 2));
  let end = start + max - 1;
  if (end > tp) {
    end = tp;
    start = Math.max(1, end - max + 1);
  }
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
});
</script>
