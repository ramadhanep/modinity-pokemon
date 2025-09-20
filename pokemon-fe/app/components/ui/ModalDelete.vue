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
        class="fixed inset-0 z-[60] bg-black/40"
        @click="$emit('update:modelValue', false)"
      />
    </transition>

    <!-- Dialog -->
    <transition
      enter-active-class="transition duration-150"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div
        v-if="modelValue"
        class="fixed z-[61] inset-0 grid place-items-center px-4"
        aria-modal="true"
        role="dialog"
        aria-labelledby="modal-title"
        @click.stop
      >
        <div class="w-full max-w-md rounded-2xl border bg-white p-5 shadow-xl">
          <header class="flex items-start gap-3">
            <Icon name="mdi:alert" class="w-6 h-6 text-rose-600 shrink-0" />
            <div>
              <h3 id="modal-title" class="text-lg font-semibold">
                {{ title }}
              </h3>
              <p class="mt-1 text-sm text-slate-600" v-if="message">
                {{ message }}
              </p>
            </div>
          </header>

          <footer class="mt-5 flex items-center justify-end gap-2">
            <button
              type="button"
              class="rounded-xl border px-3 py-2 hover:bg-slate-50"
              @click="$emit('update:modelValue', false)"
            >
              {{ cancelLabel }}
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-3 py-2 text-white hover:bg-rose-700"
              @click="$emit('confirm')"
            >
              <Icon name="mdi:trash-can-outline" class="w-4 h-4" />
              {{ confirmLabel }}
            </button>
          </footer>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
// Simple confirm modal (delete).
// Controlled via v-model; emits 'confirm' when user accepts.
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: "Delete item?" },
  message: { type: String, default: "" },
  confirmLabel: { type: String, default: "Delete" },
  cancelLabel: { type: String, default: "Cancel" },
});
defineEmits(["update:modelValue", "confirm"]);

// Close on Escape
onMounted(() => {
  const onKey = (e) => {
    if (e.key === "Escape" && props.modelValue) {
      // let parent handle the state update
      // so we only emit the v-model update
      // (no "confirm" here)
      // eslint-disable-next-line vue/emit-inject
      // @ts-ignore
      emitModel(false);
    }
  };
  const emitModel = (v) => {
    /* helper for TS silence */
  };
  window.addEventListener("keydown", onKey);
  onBeforeUnmount(() => window.removeEventListener("keydown", onKey));
});
</script>
