<template>
  <div class="bg-slate-900 text-slate-50 h-full relative" ref="canvas">
    <div class="absolute"><button @click="toggleCursor">toogle</button></div>
  </div>
</template>

<script setup lang="ts">
import * as PIXI from 'pixi.js'
import { onMounted, ref } from 'vue'
import { Game } from './game/Game'
import Constants from './game/Constants'
import { Cursor } from './game/Cursor'

const canvas = ref<HTMLElement | null>(null)
setTimeout(() => {
  toggleCursor()
}, 1000)

let game: Game

onMounted(() => {
  if (canvas.value) {
    game = new Game(canvas.value)
  }
})

let cursor: Cursor | undefined

/**
 *
 */
function toggleCursor() {
  if (cursor) {
    cursor.destroy()
    cursor = undefined
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

  cursor = new Cursor(container, game)
}
</script>

<style>
html,
body,
#app {
  @apply h-full;
}
</style>
