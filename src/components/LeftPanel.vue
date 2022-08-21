<template>
  <div class="h-full card-1 w-96">
    <h1 class="text-3xl px-6 py-4">Buildings</h1>
    <div class="flex flex-col">
      <button
        @click="toggleCursor(building)"
        v-for="building of buildings"
        :class="{
          '!bg-slate-50 !text-slate-900': cursor && cursor.building === building,
        }"
        class="text-slate-50 flex items-center h-10"
      >
        <img
          :src="building.textureURL"
          class="aspect-square w-8 mx-3 mb-1 bg-slate-50 rounded-sm"
        />
        {{ building.label }} ({{ building.width }}x{{ building.height }})
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { B1 } from '@/game/buildings/B1'
import { DestroyBuilding } from '@/game/buildings/DestroyBuilding'
import type { Building } from '@/game/buildings/Building'
import Constants from '@/game/Constants'
import { Cursor } from '@/game/Cursor'
import type { Game } from '@/game/Game'
import { useGameStore } from '@/stores/game'
import { Container, Graphics } from 'pixi.js'
import { ref } from 'vue'

let cursor = ref<Cursor | undefined>()

const gameStore = useGameStore()

const buildings = [new B1(), new DestroyBuilding()]

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
      Constants.tileSize * building.width,
      Constants.tileSize * building.height,
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
