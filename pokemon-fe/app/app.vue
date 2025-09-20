<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
    <TopNav />

    <main class="container mx-auto px-4 py-6 flex-1">
      <NuxtPage />
    </main>

    <!-- Footer -->
    <footer class="border-t">
      <div
        class="container mx-auto px-4 h-14 flex items-center justify-between"
      >
        <p class="text-sm text-slate-600">
          © {{ year }} {{ siteName }}. All rights reserved.
        </p>

        <a
          :href="githubUrl"
          class="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View on GitHub"
          title="View on GitHub"
        >
          <Icon name="mdi:github" class="w-5 h-5" />
          <span class="hidden sm:inline">GitHub</span>
        </a>
      </div>
    </footer>
  </div>
</template>

<script setup>
import TopNav from "~/components/TopNav.vue";

const config = useRuntimeConfig();
const siteName = config.public.siteName;
const githubUrl = config.public.githubUrl;

const year = new Date().getFullYear();
</script>
