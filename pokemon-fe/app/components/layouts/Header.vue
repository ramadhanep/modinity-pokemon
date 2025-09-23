<template>
  <header class="sticky top-0 z-20 bg-white/80 backdrop-blur border-b">
    <nav>
      <div class="container mx-auto px-4 h-16 flex items-center justify-between">
        <NuxtLink to="/"
          >
          <img src="~/assets/images/modinity-pokemon.webp" alt="Modinity" class="w-72">
        </NuxtLink
        >
        <div class="flex items-center gap-2">
          <NuxtLink
            to="/"
            class="px-3 py-1.5 rounded-xl hover:bg-slate-100"
            exact-active-class="bg-slate-200"
            >Pokedex</NuxtLink
          >
          <NuxtLink
            to="/favorites"
            class="px-3 py-1.5 rounded-xl hover:bg-slate-100"
            exact-active-class="bg-slate-200"
            >Favorites</NuxtLink
          >
          <NuxtLink
            to="/team"
            class="px-3 py-1.5 rounded-xl hover:bg-slate-100"
            exact-active-class="bg-slate-200"
            >Team</NuxtLink
          >
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup></script>
