<template>
  <div class="h-full card-1 rounded-3xl px-6 py-4 w-96">
    <h1 class="text-3xl">Buildings</h1>
    <div class="flex flex-col p-8">
      <button
        @click="toggleCursor(building)"
        v-for="building of buildings"
        :class="{
          'bg-slate-400': cursor && cursor.building === building,
        }"
        class="p-4 rounded-full"
      >
        toggle {{ building.data.width }}x{{ building.data.height }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { B1 } from '@/game/buildings/B1'
import { Building } from '@/game/buildings/Building'
import Constants from '@/game/Constants'
import { Cursor } from '@/game/Cursor'
import type { Game } from '@/game/Game'
import { useGameStore } from '@/stores/game'
import { Container, Graphics } from 'pixi.js'
import { ref } from 'vue'

let cursor = ref<Cursor | undefined>()

const gameStore = useGameStore()

const buildings = [new Building(B1)]

function toggleCursor(building: Building) {
  if (!gameStore.game) return
  if (cursor.value) {
    cursor.value.destroy()
  }

  const container = new Container()

  const rect = new Graphics()
  rect
    .beginFill(0xffffff, 0.7)
    .drawRoundedRect(
      0,
      0,
      Constants.tileSize * building.data.width,
      Constants.tileSize * building.data.height,
      Constants.tileSize / 3
    )
  container.addChild(rect)

  cursor.value = new Cursor(container, gameStore.game as Game, building)
  cursor.value.addEventListener(
    'destroy',
    () => {
      cursor.value = undefined
    },
    {
      once: true,
    }
  )
}
</script>
