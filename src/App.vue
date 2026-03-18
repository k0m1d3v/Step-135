<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 text-slate-900 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 dark:text-slate-100">
    <HeaderBar
      :tourActive="tourActive"
      :darkMode="isDark"
      @toggleTour="toggleTour"
      @toggleTheme="toggleTheme"
      @share="copyShareLink"
    />

    <main class="mx-auto max-w-6xl space-y-10 px-4 py-8">
      <SectionContainer>
        <template #header>
          <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Explore the Piazza</h2>
              <p class="text-sm text-slate-600 dark:text-slate-300">Interact with monuments and learn fun facts along the way.</p>
            </div>
            <div class="text-sm text-slate-500 dark:text-slate-400">
              Tip: Tap a marker or a card to highlight it on the map.
            </div>
          </div>
        </template>

        <MapView
          :markers="monuments"
          :center="defaultCenter"
          :activeId="activeMonumentId"
          @update:activeId="onSelectMonument"
        />
      </SectionContainer>

      <SectionContainer>
        <template #header>
          <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Monuments</h2>
              <p class="text-sm text-slate-600 dark:text-slate-300">Tap on a card to focus on its location on the map.</p>
            </div>

            <div class="flex flex-col items-start gap-2 text-sm text-slate-500 dark:text-slate-400 md:items-end">
              <span class="font-medium">Progress: {{ currentMonumentIndex + 1 }} / {{ monuments.length }}</span>
              <div class="h-1 w-40 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  class="h-full rounded-full bg-sky-500 transition-all"
                  :style="{ width: progressPercent + '%' }"
                />
              </div>
            </div>
          </div>
        </template>

        <div ref="cardGridRef" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MonumentCard
            v-for="monument in monuments"
            :key="monument.id"
            :monument="monument"
            :isActive="monument.id === activeMonumentId"
            :isSpeaking="monument.id === speakingMonumentId"
            @select="onSelectMonument"
            @listen="onListenMonument"
          />
        </div>
      </SectionContainer>

      <SectionContainer>
        <template #header>
          <div>
            <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Quiz</h2>
            <p class="text-sm text-slate-600 dark:text-slate-300">Test your knowledge about the Square with an interactive quiz.</p>
          </div>
        </template>
        <Quiz :questions="quizQuestions" />
      </SectionContainer>
    </main>

    <footer class="border-t border-white/20 bg-white/30 py-6 text-center text-sm text-slate-500 dark:bg-slate-950/40 dark:text-slate-400">
      Built with Vue 3, Tailwind CSS, and Leaflet — designed as an interactive museum walk.
    </footer>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

import HeaderBar from './components/HeaderBar.vue'
import SectionContainer from './components/SectionContainer.vue'
import MapView from './components/MapView.vue'
import MonumentCard from './components/MonumentCard.vue'
import Quiz from './components/Quiz.vue'

import { monuments } from './data/monuments'
import { quizQuestions } from './data/quiz'

const defaultCenter = [41.9058, 12.4823]
const activeMonumentId = ref(monuments[0]?.id ?? null)
const tourActive = ref(false)
const tourIndex = ref(0)
let tourInterval = null

const cardGridRef = ref(null)

const isDark = ref(false)
const speakingMonumentId = ref(null)
const manuallyStopped = ref(false)

const currentMonumentIndex = computed(() => monuments.findIndex((m) => m.id === activeMonumentId.value))
const progressPercent = computed(() => {
  const idx = currentMonumentIndex.value
  return idx < 0 ? 0 : ((idx + 1) / monuments.length) * 100
})

const storageKeys = {
  active: 'step135-active',
  quiz: 'step135-quiz',
}

function loadTheme() {
  try {
    const stored = localStorage.getItem('theme')
    if (stored === 'dark') {
      isDark.value = true
    } else if (stored === 'light') {
      isDark.value = false
    } else {
      // default based on system preference
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
  } catch {
    isDark.value = false
  }
}

function applyTheme() {
  document.documentElement.classList.toggle('dark', isDark.value)
  try {
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  } catch {
    // ignore storage errors
  }
}

function toggleTheme() {
  isDark.value = !isDark.value
}

watch(isDark, applyTheme, { immediate: true })

function updateUrlWithFocus(id) {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  if (id) {
    url.searchParams.set('focus', id)
  } else {
    url.searchParams.delete('focus')
  }
  window.history.replaceState({}, '', url)
}

function persistActiveId(id) {
  try {
    if (id) {
      localStorage.setItem(storageKeys.active, id)
    } else {
      localStorage.removeItem(storageKeys.active)
    }
  } catch {
    // ignore errors
  }
}

function scrollToActiveCard() {
  nextTick(() => {
    const container = cardGridRef.value
    if (!container) return
    const active = container.querySelector('.active-card')
    if (active) {
      active.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
}

function setActiveMonument(id) {
  activeMonumentId.value = id
  persistActiveId(id)
  updateUrlWithFocus(id)
  scrollToActiveCard()
}

function onSelectMonument(id) {
  setActiveMonument(id)
  // if the user manually selects, stop automatic tour mode
  if (tourActive.value) {
    stopTour()
  }
}

function onListenMonument(monument) {
  if (speakingMonumentId.value === monument.id) {
    stopSpeech()
  } else {
    trySpeak(monument)
  }
}

function toggleTour() {
  if (tourActive.value) {
    stopTour()
  } else {
    startTour()
  }
}

function startTour() {
  tourActive.value = true
  tourIndex.value = monuments.findIndex((m) => m.id === activeMonumentId.value)
  if (tourIndex.value < 0) tourIndex.value = 0
  tourInterval = setInterval(() => {
    tourIndex.value = (tourIndex.value + 1) % monuments.length
    setActiveMonument(monuments[tourIndex.value].id)
  }, 6500)
}

function stopTour() {
  tourActive.value = false
  clearInterval(tourInterval)
  tourInterval = null
}

onUnmounted(() => {
  stopTour()
})

function stopSpeech() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
  speakingMonumentId.value = null
  manuallyStopped.value = true
}

function trySpeak(monument) {
  if (!window.speechSynthesis) return
  const utterance = new SpeechSynthesisUtterance(`${monument.name}. ${monument.description}. Fun fact: ${monument.funFact}`)
  utterance.rate = 1
  utterance.pitch = 1
  utterance.lang = 'it-IT' // Imposta la lingua italiana

  stopSpeech()

  speakingMonumentId.value = monument.id
  manuallyStopped.value = false

  utterance.onend = () => {
    speakingMonumentId.value = null
    if (!tourActive.value && !manuallyStopped.value) {
      const nextIndex = (currentMonumentIndex.value + 1) % monuments.length
      const next = monuments[nextIndex]
      if (next) {
        setActiveMonument(next.id)
        // play the next one automatically
        trySpeak(next)
      }
    }
  }

  window.speechSynthesis.speak(utterance)
}

function copyShareLink() {
  const url = new URL(window.location.href)
  url.searchParams.set('focus', activeMonumentId.value)
  const toCopy = url.toString()
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(toCopy).then(() => {
      alert('Share link copied!')
    })
  } else {
    prompt('Copy this link:', toCopy)
  }
}

loadTheme()

onMounted(() => {
  // Apply saved focus or URL focus
  try {
    const params = new URLSearchParams(window.location.search)
    const focus = params.get('focus')
    const stored = localStorage.getItem(storageKeys.active)
    const chosen = focus || stored
    if (chosen && monuments.some((m) => m.id === chosen)) {
      setActiveMonument(chosen)
    }
  } catch {
    // ignore
  }
})
</script>
