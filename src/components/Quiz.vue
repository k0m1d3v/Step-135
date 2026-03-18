<template>
  <div class="rounded-2xl border border-white/20 bg-white/40 p-6 shadow-glass transition-smooth dark:border-slate-700 dark:bg-slate-900/40">
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">Question {{ currentIndex + 1 }} of {{ questions.length }}</p>
        <h3 class="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">{{ currentQuestion.question }}</h3>
      </div>

      <div class="flex items-center gap-2 text-sm">
        <span class="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-slate-600 dark:bg-slate-900/40 dark:text-slate-200">
          <span class="h-2 w-2 rounded-full bg-emerald-500" />
          Score: {{ score }}
        </span>
        <button
          type="button"
          @click="resetQuiz"
          class="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200"
        >
          Reset
        </button>
      </div>
    </div>

    <div class="mt-6 space-y-3">
      <button
        v-for="(option, idx) in currentQuestion.options"
        :key="idx"
        :class="answerButtonClasses(idx)"
        @click="selectAnswer(idx)"
      >
        <span class="flex-1 text-left">{{ option }}</span>

        <span v-if="selectedIndex === idx" class="ml-3 text-xs font-semibold">
          <span v-if="isSelectedCorrect" class="text-emerald-700">Correct ✓</span>
          <span v-else class="text-rose-700">Wrong ✕</span>
        </span>
      </button>
    </div>

    <div v-if="selectedIndex !== null" class="mt-6 flex flex-col gap-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-700 dark:bg-slate-900/30 dark:text-slate-200">
      <p>
        <span class="font-semibold">Explanation:</span>
        The correct answer is <span class="font-semibold">{{ correctOption }}</span>.
      </p>

      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          class="rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-300 dark:bg-slate-900/30 dark:text-slate-200"
          @click="goNext"
        >
          Next question
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  questions: { type: Array, required: true },
  storageKey: { type: String, default: 'step135-quiz' },
})

const currentIndex = ref(0)
const selectedIndex = ref(null)
const score = ref(0)

// Persist quiz state so users can return later
try {
  const stored = localStorage.getItem(props.storageKey)
  if (stored) {
    const parsed = JSON.parse(stored)
    if (typeof parsed?.index === 'number') currentIndex.value = parsed.index
    if (typeof parsed?.score === 'number') score.value = parsed.score
  }
} catch {
  // ignore storage failures
}

const currentQuestion = computed(() => props.questions[currentIndex.value])
const correctOption = computed(() => currentQuestion.value.options[currentQuestion.value.answerIndex])

const isSelectedCorrect = computed(() => selectedIndex.value === currentQuestion.value.answerIndex)

const answerButtonClasses = (idx) => {
  const base = 'flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition'
  const selected = selectedIndex.value === idx

  if (selected) {
    return [
      base,
      isSelectedCorrect.value ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-rose-200 bg-rose-50 text-rose-900',
    ].join(' ')
  }

  return [
    base,
    'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50',
  ].join(' ')
}

function selectAnswer(idx) {
  if (selectedIndex.value !== null) return
  selectedIndex.value = idx
  if (idx === currentQuestion.value.answerIndex) {
    score.value += 1
  }
  persistState()
}

function goNext() {
  if (currentIndex.value < props.questions.length - 1) {
    currentIndex.value += 1
    selectedIndex.value = null
    persistState()
  }
}

function persistState() {
  try {
    localStorage.setItem(
      props.storageKey,
      JSON.stringify({ index: currentIndex.value, score: score.value })
    )
  } catch {
    // ignore storage failures
  }
}

function resetQuiz() {
  currentIndex.value = 0
  selectedIndex.value = null
  score.value = 0
  try {
    localStorage.removeItem(props.storageKey)
  } catch {
    // ignore
  }
}
</script>
