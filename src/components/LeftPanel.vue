<template>
  <div class="h-full card-1 rounded-3xl px-6 py-4 w-96">
    <h1 class="text-3xl">Buildings</h1>
    <div class="flex flex-col p-8">
      <button
        @click="toggleCursor(cursorSize)"
        v-for="cursorSize of cursorsSize"
        :class="{
          'bg-slate-400':
            cursor && cursor.width === cursorSize.width && cursor.heigth === cursorSize.heigth,
        }"
        class="p-4 rounded-full"
      >
        toggle {{ cursorSize.width }}x{{ cursorSize.heigth }}
      </button>
    </div>
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

B1.loadTexture() //TODO enlever ca

const cursorsSize: { width: number; heigth: number }[] = [
  { width: 1, heigth: 1 },
  { width: 2, heigth: 2 },
  { width: 3, heigth: 3 },
  { width: 10, heigth: 1 },
  { width: 1, heigth: 10 },
  { width: 32, heigth: 32 },
]

function toggleCursor(size: { width: number; heigth: number }) {
  if (!gameStore.game) return
  if (cursor.value) {
    cursor.value.destroy()
  }

  const container = new PIXI.Container()

  const rect = new PIXI.Graphics()
  rect
    .beginFill(0xffffff, 0.7)
    .drawRoundedRect(
      0,
      0,
      Constants.tileSize * size.width,
      Constants.tileSize * size.heigth,
      Constants.tileSize / 3
    )
  container.addChild(rect)

  cursor.value = new Cursor(container, gameStore.game as Game, size.width, size.heigth)
}
</script>
