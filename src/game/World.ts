import type { Game } from './Game'
import type { Viewport } from 'pixi-viewport'
import * as PIXI from 'pixi.js'
import Constants from './Constants'

/**
 * Représente le fond du canvas
 */
export class World {
  background: PIXI.Sprite

  chunks = {
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
  }

  private game: Game

  constructor(game: Game) {
    this.game = game

    this.background = new PIXI.Sprite()
    game.viewport.addChild(this.background)

    this.game.viewport.on('move', this.refreshChunks)
    this.refreshChunks()
  }

  /**
   * calcul les chunks a afficher et re-render s'ils changent
   */
  refreshChunks() {
    const renderTexture = PIXI.RenderTexture.create({
      width: Constants.tileSize * 50,
      height: Constants.tileSize * 50,
    })
    this.background.texture = renderTexture

    const container = new PIXI.Container()

    const components = { r: 50, g: 180 + Math.random() * 8, b: 50 }

    const color = (components.r << 16) + (components.g << 8) + components.b

    const cross = new PIXI.Graphics()
    cross.beginFill(color)
    cross.drawRect(0, 0, Constants.tileSize, Constants.tileSize)
    cross.x = 0 * Constants.tileSize
    cross.y = 0 * Constants.tileSize
    container.addChild(cross)
    this.game.app.renderer.render(container, {
      renderTexture: renderTexture,
    })
    container.destroy()
  }

  getGridPostition(pos: { x: number; y: number }) {
    return {
      x: pos.x / Constants.tileSize,
      y: pos.y / Constants.tileSize,
    }
  }
}
