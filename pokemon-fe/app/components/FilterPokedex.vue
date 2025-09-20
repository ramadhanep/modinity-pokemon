<template>
  <Teleport to="body">
    <!-- Overlay -->
    <transition
      enter-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[60] bg-black/35"
        @click="$emit('update:modelValue', false)"
      />
    </transition>

    <!-- Panel -->
    <transition
      enter-active-class="transform transition duration-200"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transform transition duration-200"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <aside
        v-if="modelValue"
        class="fixed top-0 right-0 z-[60] h-full w-96 max-w-[90vw] bg-white border-l shadow-xl p-4 flex flex-col"
        @click.stop
        role="dialog"
        aria-modal="true"
        aria-label="Filter"
      >
        <header class="flex items-center justify-between mb-4 p-2">
          <h3 class="text-lg font-semibold">Filter</h3>
          <button
            class="rounded-lg hover:bg-slate-50"
            @click="$emit('update:modelValue', false)"
            type="button"
          >
            <Icon name="mdi:close" class="w-5 h-5" />
          </button>
        </header>

        <form class="space-y-6 overflow-y-auto p-2" @submit.prevent="apply">
          <!-- Name / ID -->
          <section>
            <label class="block text-sm font-medium mb-1">ID / Name</label>
            <input
              v-model.trim="localQ"
              type="text"
              placeholder="e.g., bulbasaur or 25"
              class="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-primary-500"
            />
          </section>

          <!-- Types -->
          <section>
            <label class="block text-sm font-medium mb-2">Types</label>
            <div class="flex flex-wrap gap-2">
              <label
                v-for="t in types"
                :key="t"
                class="inline-flex items-center gap-2 rounded-full border px-3 py-1 capitalize cursor-pointer"
                :class="
                  localTypeSet.has(t)
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'hover:bg-slate-50'
                "
              >
                <input
                  type="checkbox"
                  class="hidden"
                  :checked="localTypeSet.has(t)"
                  @change="toggleType(t)"
                />
                {{ t }}
              </label>
            </div>
          </section>

          <button
            type="submit"
            class="w-full text-center rounded-lg bg-primary-600 text-white px-4 py-2 hover:bg-primary-700"
          >
            Apply Filter
          </button>
        </form>
      </aside>
    </transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  types: { type: Array, default: () => [] },
  q: { type: String, default: "" },
  selected: { type: Array, default: () => [] },
});
const emit = defineEmits([
  "update:modelValue",
  "update:q",
  "update:selected",
  "apply",
]);

// Local state is synced from props when the panel opens
const localQ = ref(props.q);
const localTypeSet = ref(new Set(props.selected));

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      localQ.value = props.q;
      localTypeSet.value = new Set(props.selected);
    }
  }
);

// Keep inputs in sync if parent changes while open
watch(
  () => props.q,
  (v) => {
    localQ.value = v;
  }
);
watch(
  () => props.selected,
  (arr) => {
    localTypeSet.value = new Set(arr);
  }
);

const toggleType = (t) => {
  const s = new Set(localTypeSet.value);
  s.has(t) ? s.delete(t) : s.add(t);
  localTypeSet.value = s;
};

const apply = () => {
  const types = Array.from(localTypeSet.value);
  emit("update:q", localQ.value);
  emit("update:selected", types);
  emit("apply", { q: localQ.value, types });
  emit("update:modelValue", false);
};

// Close on Escape
onMounted(() => {
  const onKey = (e) => {
    if (e.key === "Escape" && props.modelValue)
      emit("update:modelValue", false);
  };
  window.addEventListener("keydown", onKey);
  onBeforeUnmount(() => window.removeEventListener("keydown", onKey));
});
</script>
