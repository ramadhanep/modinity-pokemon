<template>
  <transition
    enter-active-class="transition duration-200"
    enter-from-class="translate-y-2 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-150"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="message"
      class="fixed z-50 rounded-xl px-4 py-2 shadow-lg border bg-white text-slate-800 flex items-center gap-2"
      :class="[positionClass, borderClass]"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <Icon :name="iconName" class="w-5 h-5" />
      <span>{{ message }}</span>
    </div>
  </transition>
</template>

<script setup>
// Minimal toast component.
// Show when `message` is non-empty; hide when it's cleared by the parent.
const props = defineProps({
  message: { type: String, default: "" },
  kind: {
    type: String,
    default: "success", // 'success' | 'error' | 'info' | 'warning'
    validator: (v) => ["success", "error", "info", "warning"].includes(v),
  },
  position: {
    type: String,
    default: "top", // 'top' | 'bottom'
    validator: (v) => ["top", "bottom"].includes(v),
  },
});

// Icons use Material Design Icons via @nuxt/icon
const iconName = computed(() => {
  if (props.kind === "error") return "mdi:close-circle";
  if (props.kind === "warning") return "mdi:alert-circle";
  if (props.kind === "info") return "mdi:information";
  return "mdi:check-circle";
});

// Subtle border color per kind
const borderClass = computed(() => {
  if (props.kind === "error") return "border-rose-300";
  if (props.kind === "warning") return "border-amber-300";
  if (props.kind === "info") return "border-sky-300";
  return "border-emerald-300";
});

// Centered horizontally; stick to top or bottom
const positionClass = computed(() =>
  props.position === "bottom"
    ? "bottom-6 left-1/2 -translate-x-1/2"
    : "top-3 left-1/2 -translate-x-1/2"
);
</script>
