import { redFilter } from './filters/red'
import type { Game } from './Game'
import Constants from './Constants'
import type { Container, InteractionEvent } from 'pixi.js'

/**
 * Dessine un mesh qui suit le pointer sur la grille du jeu
 */
export class Cursor extends EventTarget {
  mesh: Container

  /**
   * Tile size
   */
  width: number
  heigth: number

  targetPosition?: { x: number; y: number }
  animationStartTime = 0

  dragging = false

  private game: Game

  constructor(mesh: Container, game: Game, width = 1, heigth = 1) {
    super()
    this.mesh = mesh
    this.game = game
    this.width = width
    this.heigth = heigth

    // Permet de passer this dans les listeners
    this.handleClick = this.handleClick.bind(this)
    this.refreshPosition = this.refreshPosition.bind(this)
    this.startDragging = this.startDragging.bind(this)
    this.lerp = this.lerp.bind(this)

    this.mesh.zIndex = 999
    this.refreshPosition()
    this.game.viewport.addChild(this.mesh)

    this.setListeners()
  }

  setListeners() {
    this.game.viewport.on('pointertap', this.handleClick)
    this.game.viewport.on('pointermove', this.refreshPosition)
    this.game.viewport.on('moved', this.refreshPosition)
    this.game.viewport.on('drag-start', this.startDragging)

    this.game.changeCursorMode('pointer')
  }

  refreshPosition() {
    if (this.mesh && !this.mesh.destroyed) {
      const mousePos = this.game.viewport.toWorld(
        this.game.app.renderer.plugins.interaction.mouse.global
      )

      // Décale d'un demi bloc si la taille est impaire
      const xIsOdd = this.width % 2 === 0 ? 0 : Constants.tileSize / 2
      const yIsOdd = this.heigth % 2 === 0 ? 0 : Constants.tileSize / 2

      // Snap sur la grille
      const snapPos = {
        x: Math.round((mousePos.x - xIsOdd) / Constants.tileSize) * Constants.tileSize,
        y: Math.round((mousePos.y - yIsOdd) / Constants.tileSize) * Constants.tileSize,
      }

      // Décalage du à la taille du curseur
      snapPos.x -= Constants.tileSize * Math.floor(this.width / 2)
      snapPos.y -= Constants.tileSize * Math.floor(this.heigth / 2)

      // evite d'animer lors du premier positionnement
      if (!this.targetPosition) {
        this.mesh.position = snapPos
      } else {
        // pas de refresh si on a pas bougé
        if (snapPos.x === this.targetPosition.x && snapPos.y === this.targetPosition.y) return
      }

      this.targetPosition = snapPos
      this.checkLand()

      this.game.app.ticker.remove(this.lerp)
      this.game.app.ticker.add(this.lerp)
    }
  }

  /**
   * Interpolation de la position du curseur
   */
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

  checkLand() {
    if (!this.targetPosition) return
    const length = this.mesh.filters?.length ?? 0
    if (
      this.game.world.checkLand(
        this.targetPosition.x,
        this.targetPosition.y,
        this.width,
        this.heigth
      ) &&
      length === 0
    ) {
      this.mesh.filters = [redFilter]
    } else if (length > 0) {
      this.mesh.filters = []
    }
  }

  startDragging() {
    this.dragging = true
  }

  handleClick(event: InteractionEvent) {
    if (!this.dragging && this.targetPosition) {
      switch (event.data.button) {
        case 2:
          this.destroy()
          break

        default:
          this.dispatchEvent(new CustomEvent('click', { detail: this.targetPosition }))
          console.log(this.game.world.getGridPostition(this.targetPosition))
      }
    } else {
      this.dragging = false
    }
  }

  destroy() {
    this.mesh.destroy()
    this.game.app.ticker.remove(this.lerp)
    if (!this.game.world || !this.game.viewport) return

    this.game.viewport.removeListener('pointertap', this.handleClick)
    this.game.viewport.removeListener('pointermove', this.refreshPosition)
    this.game.viewport.removeListener('moved', this.refreshPosition)
    this.game.viewport.removeListener('drag-start', this.startDragging)

    this.game.changeCursorMode('auto')

    this.dispatchEvent(new Event('destroy'))
  }

  private _lerp(a: number, b: number, t: number) {
    return (b - a) * t + a
  }
}
