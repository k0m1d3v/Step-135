<template>
  <div class="relative w-full overflow-hidden rounded-xl border border-slate-200 bg-white/40 shadow-lg dark:border-slate-700 dark:bg-slate-950/40">
    <div
      ref="mapRoot"
      class="h-[320px] min-h-[320px] w-full sm:h-[420px] md:h-[520px]"
    ></div>

    <div
      v-if="isLoading"
      class="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/30 backdrop-blur"
    >
      <div class="flex flex-col items-center gap-3 rounded-xl border border-white/20 bg-white/40 px-6 py-5 text-sm text-slate-800 shadow-lg dark:bg-slate-900/50 dark:text-slate-100">
        <div class="h-10 w-10 animate-spin rounded-full border-4 border-sky-500 border-t-transparent"></div>
        <div>Loading map tiles…</div>
      </div>
    </div>

    <div class="pointer-events-none absolute right-4 top-4 rounded-full bg-white/90 px-3 py-2 text-xs font-medium text-slate-700 shadow dark:bg-slate-900/60 dark:text-slate-100">
      Tap markers to learn more.
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

const props = defineProps({
  markers: { type: Array, required: true },
  center: { type: Array, required: true },
  zoom: { type: Number, default: 17 },
  activeId: { type: String, default: null },
})

const emit = defineEmits(['update:activeId'])

const mapRoot = ref(null)
let map = null
let markerCluster = null
const markerMap = new Map()
const isLoading = ref(true)

const baseIconOptions = {
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -32],
}

const markerIcon = (isActive) =>
  L.icon({
    ...baseIconOptions,
    className: isActive ? 'marker-icon marker-icon--active' : 'marker-icon',
  })

const createMarker = (markerData) => {
  const marker = L.marker(markerData.coordinates, {
    icon: markerIcon(markerData.id === props.activeId),
  })

  markerCluster.addLayer(marker)

  const popupContent = `
    <div style="font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
      <h3 style="margin:0 0 0.4rem; font-weight:600;">${markerData.name}</h3>
      <p style="margin:0 0 0.5rem; color:#334155;">${markerData.description}</p>
      <p style="margin:0; color:#64748b;"><strong>Fun fact:</strong> ${markerData.funFact}</p>
    </div>
  `

  marker.bindPopup(popupContent)

  marker.on('click', () => {
    emit('update:activeId', markerData.id)
  })

  markerMap.set(markerData.id, marker)
}

const highlightMarker = (id) => {
  if (!map || !id) return

  const marker = markerMap.get(id)
  if (!marker) return

  const target = props.markers.find((m) => m.id === id)
  if (target) {
    map.flyTo(target.coordinates, props.zoom, {
      animate: true,
      duration: 1.2,
    })
  }

  // if using clustering, ensure the marker is visible
  if (markerCluster) {
    markerCluster.zoomToShowLayer(marker, () => {
      marker.openPopup()
    })
  } else {
    marker.openPopup()
  }

  // update marker icons
  markerMap.forEach((m, key) => {
    m.setIcon(markerIcon(key === id))
  })
}

let resizeObserver

onMounted(() => {
  map = L.map(mapRoot.value, {
    center: props.center,
    zoom: props.zoom,
    scrollWheelZoom: true,
  })

  const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map)

  // show spinner while tiles are loading
  tileLayer.on('loading', () => {
    isLoading.value = true
  })
  tileLayer.on('load', () => {
    isLoading.value = false
  })

  markerCluster = L.markerClusterGroup({
    showCoverageOnHover: false,
    maxClusterRadius: 50,
  })
  map.addLayer(markerCluster)

  props.markers.forEach(createMarker)

  if (props.activeId) {
    highlightMarker(props.activeId)
  }

  // Leaflet needs a resize event when the container changes size (mobile/rotation)
  resizeObserver = new ResizeObserver(() => {
    if (map) {
      map.invalidateSize()
    }
  })
  resizeObserver.observe(mapRoot.value)

  // Some mobile browsers layout asynchronously; ensure Leaflet recalculates after render.
  window.requestAnimationFrame(() => {
    map.invalidateSize()
    setTimeout(() => map.invalidateSize(), 250)
  })
})

watch(
  () => props.activeId,
  (id) => {
    highlightMarker(id)
  }
)

watch(
  () => props.center,
  (newCenter) => {
    if (map && newCenter) {
      map.setView(newCenter, props.zoom)
    }
  }
)

onBeforeUnmount(() => {
  map?.remove()
  markerMap.clear()
  resizeObserver?.disconnect()
})
</script>
