<template>
  <header class="sticky top-0 z-30 border-b border-white/20 bg-white/40 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/40">
    <div class="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-5">
      <div>
        <h1 class="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 md:text-2xl">Step 135</h1>
        <p class="text-sm text-slate-600 dark:text-slate-300">A guided stroll through Piazza di Spagna, Rome.</p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          @click="$emit('toggleTour')"
          class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/60 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200 dark:hover:bg-slate-900"
        >
          <span v-if="!tourActive">🚶‍♂️ Tour Mode</span>
          <span v-else>⏹️ Stop Tour</span>
        </button>

        <button
          type="button"
          @click="$emit('share')"
          class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/60 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200 dark:hover:bg-slate-900"
        >
          🔗 Share
        </button>

        <button
          type="button"
          @click="$emit('toggleTheme')"
          class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/60 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200 dark:hover:bg-slate-900"
        >
          <span v-if="!darkMode">🌙 Dark</span>
          <span v-else>☀️ Light</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
const props = defineProps({
  tourActive: { type: Boolean, default: false },
  darkMode: { type: Boolean, default: false },
})
</script>
