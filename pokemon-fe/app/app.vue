<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
    <Header />

    <main class="container mx-auto px-4 py-6 flex-1">
      <NuxtPage />
    </main>

    <Footer />
  </div>
</template>

<script setup>
import Header from "~/components/layouts/Header.vue";
import Footer from "~/components/layouts/Footer.vue";
</script>
