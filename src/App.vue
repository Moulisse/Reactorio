<template>
  <div class="bg-slate-900 text-slate-50 h-full relative" ref="canvas">
    <div class="absolute"><button @click="toggleCursor">toogle</button></div>
  </div>
</template>

<script setup lang="ts">
import * as PIXI from 'pixi.js'
import { Viewport } from 'pixi-viewport'
import { onMounted, ref } from 'vue'

const canvas = ref<HTMLElement | null>(null)
setTimeout(() => {
  toggleCursor()
}, 1000)

let viewport: Viewport
let app: PIXI.Application
let world: PIXI.Sprite

onMounted(() => {
  if (canvas.value) {
    app = new PIXI.Application({
      resizeTo: window,
      antialias: true,
    })
    canvas.value.appendChild(app.view)

    // create viewport
    viewport = new Viewport({
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      worldWidth: 1000,
      worldHeight: 1000,

      interaction: app.renderer.plugins.interaction,
    })

    // add the viewport to the stage
    app.stage.addChild(viewport)

    // activate plugins
    viewport
      .drag()
      .wheel({
        smooth: 10,
      })
      .decelerate({
        friction: 0.9,
        minSpeed: 0.01,
      })
      .moveCenter(0, 0)

    world = createWorld()
  }
})

/**
 *
 */
function createWorld() {
  const size = 100

  const wheelRenderTexture = PIXI.RenderTexture.create({ width: 40 * size, height: 40 * size })
  const wheelRenderSprite = new PIXI.Sprite(wheelRenderTexture)
  viewport.addChild(wheelRenderSprite)

  const container = new PIXI.Container()
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const components = { r: 50, g: 180 + Math.random() * 8, b: 50 }

      const color = (components.r << 16) + (components.g << 8) + components.b

      const bunny = new PIXI.Graphics()
      bunny.beginFill(color)
      bunny.drawRect(0, 0, 40, 40)
      bunny.x = i * 40
      bunny.y = j * 40
      container.addChild(bunny)
    }
  }

  wheelRenderSprite.pivot.x = wheelRenderSprite.width / 2
  wheelRenderSprite.pivot.y = wheelRenderSprite.height / 2

  app.renderer.render(container, { renderTexture: wheelRenderTexture })

  return wheelRenderSprite
}

let cursor: CursorMesh | undefined

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

  cursor = new CursorMesh({ mesh: container })
  cursor.setListeners(world, viewport)
}

class CursorMesh {
  mesh: PIXI.Container

  targetPosition?: { x: number; y: number }
  animationStartTime = 0

  canClick = true

  private world?: PIXI.Sprite
  private viewport?: Viewport

  constructor(data: { mesh: PIXI.Container }) {
    this.mesh = data.mesh

    // Permet de passer this dans les listeners
    this.handleClick = this.handleClick.bind(this)
    this.refreshPosition = this.refreshPosition.bind(this)
    this.disableClick = this.disableClick.bind(this)
    this.hide = this.hide.bind(this)
    this.show = this.show.bind(this)
    this.lerp = this.lerp.bind(this)

    this.mesh.visible = false
    this.refreshPosition()
    viewport.addChild(this.mesh)
  }

  lerp() {
    if (this.targetPosition && this.mesh) {
      this.mesh.position.x = this._lerp(this.mesh.position.x, this.targetPosition.x, 0.1)
      this.mesh.position.y = this._lerp(this.mesh.position.y, this.targetPosition.y, 0.1)

      const a = this.targetPosition.x - this.mesh.position.x
      const b = this.targetPosition.y - this.mesh.position.y
      const distance = Math.sqrt(a * a + b * b)

      if (distance <= 0.5) {
        this.mesh.position = this.targetPosition
        app.ticker.remove(this.lerp)
      }
    }
  }

  setListeners(world: PIXI.Sprite, viewport: Viewport) {
    world.on('pointertap', this.handleClick)
    world.on('pointermove', this.refreshPosition)
    viewport.on('moved', this.refreshPosition)
    viewport.on('drag-start', this.disableClick)
    world.on('pointerout', this.hide)
    world.on('pointerover', this.show)

    world.interactive = true
    world.buttonMode = true

    this.world = world
    this.viewport = viewport
  }

  destroy() {
    this.mesh.destroy()
    app.ticker.remove(this.lerp)
    if (!this.world || !this.viewport) return

    this.world.removeListener('pointertap', this.handleClick)
    this.world.removeListener('pointermove', this.refreshPosition)
    this.viewport.removeListener('moved', this.refreshPosition)
    viewport.removeListener('drag-start', this.disableClick)
    world.removeListener('pointerout', this.hide)
    world.removeListener('pointerover', this.show)

    this.world.interactive = false
    this.world.buttonMode = false
  }

  refreshPosition() {
    if (this.mesh && !this.mesh.destroyed) {
      const mousePos = viewport.toWorld(app.renderer.plugins.interaction.mouse.global)
      const snapPos = {
        x: Math.round((mousePos.x - 20) / 40) * 40,
        y: Math.round((mousePos.y - 20) / 40) * 40,
      }
      if (snapPos.x === this.mesh.position.x && snapPos.y === this.mesh.position.y) return
      if (!this.targetPosition) {
        this.mesh.position = snapPos
      }
      this.targetPosition = snapPos
      app.ticker.remove(this.lerp)
      app.ticker.add(this.lerp)
    }
  }

  disableClick() {
    this.canClick = false
  }

  hide() {
    this.mesh.visible = false
  }
  show() {
    this.mesh.visible = true
  }

  handleClick() {
    if (cursor) {
      if (cursor.canClick) {
        console.log('tap')
      } else {
        cursor.canClick = true
      }
    }
  }

  private _lerp(a: number, b: number, t: number) {
    return (b - a) * t + a
  }
}
</script>

<style>
html,
body,
#app {
  @apply h-full;
}
</style>
