<template>
  <section
    class="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    role="region"
    aria-roledescription="carousel"
    aria-label="Hero"
    @mouseenter="pause()"
    @mouseleave="play()"
    @keydown.left.prevent="prev()"
    @keydown.right.prevent="next()"
    tabindex="0"
  >
    <!-- Slides -->
    <div class="relative h-[250px]">
      <transition-group name="fade" tag="div">
        <div
          v-for="(s, i) in slides"
          :key="s.id"
          v-show="i === index"
          class="absolute inset-0"
        >
          <img
            :src="s.src"
            :alt="s.alt"
            class="h-full w-full object-cover"
            loading="eager"
            decoding="async"
          />

          <!-- Overlay content -->
          <div
            class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"
          ></div>
          <div class="absolute inset-x-0 bottom-0 p-14 sm:p-16">
            <div class="max-w-3xl text-white">
              <h2
                class="text-2xl sm:text-3xl lg:text-4xl font-extrabold drop-shadow"
              >
                {{ s.title }}
              </h2>
              <p class="mt-2 text-sm sm:text-base text-white/90">
                {{ s.subtitle }}
              </p>
              <div class="mt-4 flex flex-wrap gap-2">
                <NuxtLink
                  v-for="cta in s.cta"
                  :key="cta.label"
                  :to="cta.to"
                  class="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium bg-primary-600 text-white hover:bg-primary-700"
                >
                  <Icon :name="cta.icon" class="w-4 h-4" />
                  {{ cta.label }}
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </transition-group>
    </div>

    <!-- Prev/Next -->
    <button
      class="absolute left-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-full bg-white/90 hover:bg-white w-9 h-9 shadow border"
      @click="prev()"
      type="button"
      aria-label="Previous slide"
    >
      <Icon name="mdi:chevron-left" class="w-5 h-5" />
    </button>
    <button
      class="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-full bg-white/90 hover:bg-white w-9 h-9 shadow border"
      @click="next()"
      type="button"
      aria-label="Next slide"
    >
      <Icon name="mdi:chevron-right" class="w-5 h-5" />
    </button>

    <!-- Dots -->
    <div
      class="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2"
    >
      <button
        v-for="(s, i) in slides"
        :key="s.id"
        type="button"
        class="h-2.5 rounded-full transition-all"
        :class="
          i === index
            ? 'w-6 bg-white shadow'
            : 'w-2.5 bg-white/60 hover:bg-white/80'
        "
        @click="go(i)"
        :aria-label="`Go to slide ${i + 1}`"
      />
    </div>
  </section>
</template>

<script setup>
const slides = [
  {
    id: 1,
    src: "images/hero-1.webp",
    alt: "Pokedex showcase",
    title: "Build your ultimate Pokemon",
    subtitle: "Browse, filter by type, and see details quickly.",
    cta: [{ label: "Favorites", to: "/favorites", icon: "mdi:heart" }],
  },
  {
    id: 2,
    src: "images/hero-2.webp",
    alt: "Team builder",
    title: "Assemble your dream team",
    subtitle: "Add up to 6 Pokemon and manage your roster.",
    cta: [{ label: "Team", to: "/team", icon: "mdi:account-group" }],
  },
];

const index = ref(0);
const intervalMs = 5000;
let timer = null;

const next = () => (index.value = (index.value + 1) % slides.length);
const prev = () =>
  (index.value = (index.value - 1 + slides.length) % slides.length);
const go = (i) => (index.value = i);

const play = () => {
  stop();
  timer = setInterval(next, intervalMs);
};
const pause = () => stop();
const stop = () => {
  if (timer) clearInterval(timer);
  timer = null;
};

// Basic touch swipe
let touchStartX = 0;
const onTouchStart = (e) => {
  touchStartX = e.touches?.[0]?.clientX || 0;
};
const onTouchEnd = (e) => {
  const x = e.changedTouches?.[0]?.clientX || 0;
  const dx = x - touchStartX;
  if (Math.abs(dx) > 40) dx > 0 ? prev() : next();
};

onMounted(() => {
  play();
  const el = document.querySelector('[aria-roledescription="carousel"]');
  el?.addEventListener("touchstart", onTouchStart, { passive: true });
  el?.addEventListener("touchend", onTouchEnd, { passive: true });
});

onBeforeUnmount(() => {
  stop();
  const el = document.querySelector('[aria-roledescription="carousel"]');
  el?.removeEventListener("touchstart", onTouchStart);
  el?.removeEventListener("touchend", onTouchEnd);
});
</script>

<style scoped>
/* Simple crossfade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.35s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
