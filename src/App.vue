<template>
  <div class="card-1 h-full relative" ref="canvas">
    <div class="absolute inset-y-6 ml-6">
      <!-- <LeftPanel></LeftPanel> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import LeftPanel from './components/LeftPanel.vue'
import { useGameStore } from './stores/game'

const canvas = ref<HTMLElement | null>(null)

onMounted(() => {
  if (canvas.value) {
    const gameStore = useGameStore()
    gameStore.create(canvas.value)
  }
})
</script>

<style>
html,
body,
#app {
  @apply h-full select-none;
}
</style>
