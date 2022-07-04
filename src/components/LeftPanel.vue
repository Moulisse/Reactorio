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

  const container = new PIXI.Container()

  container.pivot.x = -20
  container.pivot.y = -20

  for (let i = 0; i < 4; i++) {
    const mesh = new PIXI.Graphics()

    mesh
      .beginFill(0xffffff)
      .moveTo(15, 5)
      .lineTo(15, 13)
      .arc(13, 13, 2, 0, Math.PI / 2, false)
      .lineTo(5, 15)
      .arc(5, 16.5, 1.5, -Math.PI / 2, Math.PI / 2, true)
      .lineTo(14, 18)
      .arc(14, 14, 4, Math.PI / 2, 0, true)
      .lineTo(18, 5)
      .arc(16.5, 5, 1.5, 0, Math.PI, true)

    mesh.angle = 90 * i

    container.addChild(mesh)
  }

  container.scale.set(Constants.tileSize / 40)

  cursor.value = new Cursor(container, gameStore.game)
}
</script>
