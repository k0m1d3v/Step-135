<template>
  <section :class="['space-y-4', wrapperClass]">
    <div class="glass rounded-2xl border border-white/30 p-5 shadow-glass transition-smooth">
      <slot name="header" />
    </div>
    <div class="space-y-4">
      <slot />
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  wrapperClass: { type: String, default: '' },
})
</script>
