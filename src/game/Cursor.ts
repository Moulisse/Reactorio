import type { Game } from './Game'
import type * as PIXI from 'pixi.js'
import Constants from './Constants'

/**
 * Dessine un mesh qui suit le pointer sur la grille du jeu
 */
export class Cursor {
  mesh: PIXI.Container

  targetPosition?: { x: number; y: number }
  animationStartTime = 0

  canClick = true

  private game: Game

  constructor(mesh: PIXI.Container, game: Game) {
    this.mesh = mesh
    this.game = game

    // Permet de passer this dans les listeners
    this.handleClick = this.handleClick.bind(this)
    this.refreshPosition = this.refreshPosition.bind(this)
    this.disableClick = this.disableClick.bind(this)
    this.hide = this.hide.bind(this)
    this.show = this.show.bind(this)
    this.lerp = this.lerp.bind(this)

    this.mesh.visible = false
    this.refreshPosition()
    this.game.viewport.addChild(this.mesh)

    this.setListeners()
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
        this.game.app.ticker.remove(this.lerp)
      }
    }
  }

  setListeners() {
    this.game.world.background.on('pointertap', this.handleClick)
    this.game.world.background.on('pointermove', this.refreshPosition)
    this.game.viewport.on('moved', this.refreshPosition)
    this.game.viewport.on('drag-start', this.disableClick)
    this.game.world.background.on('pointerout', this.hide)
    this.game.world.background.on('pointerover', this.show)

    this.game.world.background.interactive = true
    this.game.world.background.buttonMode = true
  }

  destroy() {
    this.mesh.destroy()
    this.game.app.ticker.remove(this.lerp)
    if (!this.game.world || !this.game.viewport) return

    this.game.world.background.removeListener('pointertap', this.handleClick)
    this.game.world.background.removeListener('pointermove', this.refreshPosition)
    this.game.viewport.removeListener('moved', this.refreshPosition)
    this.game.viewport.removeListener('drag-start', this.disableClick)
    this.game.world.background.removeListener('pointerout', this.hide)
    this.game.world.background.removeListener('pointerover', this.show)

    this.game.world.background.interactive = false
    this.game.world.background.buttonMode = false
  }

  refreshPosition() {
    if (this.mesh && !this.mesh.destroyed) {
      const mousePos = this.game.viewport.toWorld(
        this.game.app.renderer.plugins.interaction.mouse.global
      )
      const snapPos = {
        x:
          Math.round((mousePos.x - Constants.tileSize / 2) / Constants.tileSize) *
          Constants.tileSize,
        y:
          Math.round((mousePos.y - Constants.tileSize / 2) / Constants.tileSize) *
          Constants.tileSize,
      }
      if (snapPos.x === this.mesh.position.x && snapPos.y === this.mesh.position.y) return
      if (!this.targetPosition) {
        this.mesh.position = snapPos
      }
      this.targetPosition = snapPos
      this.game.app.ticker.remove(this.lerp)
      this.game.app.ticker.add(this.lerp)
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
    if (this.canClick) {
      console.log('tap')
    } else {
      this.canClick = true
    }
  }

  private _lerp(a: number, b: number, t: number) {
    return (b - a) * t + a
  }
}
