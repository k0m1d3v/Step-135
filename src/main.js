import { createApp } from 'vue'
import App from './App.vue'

import './assets/index.css'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet's default marker icon paths for Vite builds
import { Icon } from 'leaflet'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

Icon.Default.mergeOptions({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
})

createApp(App).mount('#app')
