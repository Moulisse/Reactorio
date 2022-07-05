<template>
  <div class="h-full card-1 rounded-3xl px-6 py-4 w-96">
    <h1 class="text-3xl">Buildings</h1>
    <button @click="toggleCursor" :class="{ 'border-b-2': cursor }">toggle</button>
  </div>
</template>

<script setup lang="ts">
import { B1 } from '@/game/buildings/B1'
import Constants from '@/game/Constants'
import { Cursor } from '@/game/Cursor'
import type { Game } from '@/game/Game'
import { useGameStore } from '@/stores/game'
import * as PIXI from 'pixi.js'
import { ref } from 'vue'

let cursor = ref<Cursor | undefined>()

const gameStore = useGameStore()

B1.loadTexture()

/**
 *
 */
function toggleCursor() {
  if (!gameStore.game) return
  if (cursor.value) {
    cursor.value.destroy()
    cursor.value = undefined
    return
  }

  const x = 3
  const y = 3

  const container = new PIXI.Container()

  const circle = new PIXI.Graphics()
  circle
    .beginFill(0xffffff)
    .drawRoundedRect(0, 0, Constants.tileSize * x, Constants.tileSize * y, 10)
  container.addChild(circle)

  cursor.value = new Cursor(container, gameStore.game as Game, x, y)
}
</script>
