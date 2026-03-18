<template>
  <article
    class="group flex min-h-[240px] flex-col justify-between gap-4 rounded-2xl border border-white/20 bg-white/40 p-5 shadow-glass transition-smooth hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900/40"
    :class="{
      'ring-2 ring-indigo-400': isActive,
      'active-card': isActive,
    }"
    @click="onSelect"
  >
    <div class="space-y-2">
      <div class="flex items-start justify-between gap-3">
        <h3 class="text-base font-semibold text-slate-900 dark:text-slate-100">{{ monument.name }}</h3>
        <span
          class="rounded-full bg-indigo-500/15 px-2 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-200"
          v-if="isActive"
        >
          Active
        </span>
      </div>
      <p class="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{{ monument.description }}</p>
      <p class="text-sm text-slate-500 dark:text-slate-400">
        <span class="font-semibold">Fun fact:</span> {{ monument.funFact }}
      </p>
    </div>

    <div class="flex flex-wrap gap-2">
      <button
        type="button"
        class="inline-flex items-center justify-center gap-2 rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
        :class="{ 'bg-red-600 hover:bg-red-700': isSpeaking }"
        @click.stop="onListen"
      >
        <span v-if="isSpeaking">⏹️</span>
        <span v-else>🔊</span>
        {{ isSpeaking ? 'Stop' : 'Listen' }}
      </button>

      <button
        type="button"
        class="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/30 px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-sky-400 dark:border-slate-700 dark:bg-slate-900/30 dark:text-slate-100"
        @click.stop="onSelect"
      >
        📍 Show on map
      </button>
    </div>
  </article>
</template>

<script setup>
const props = defineProps({
  monument: { type: Object, required: true },
  isActive: { type: Boolean, default: false },
  isSpeaking: { type: Boolean, default: false },
})

const emit = defineEmits(['select', 'listen'])

function onSelect() {
  emit('select', props.monument.id)
}

function onListen() {
  emit('listen', props.monument)
}
</script>
