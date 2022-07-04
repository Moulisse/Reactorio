import type { Viewport } from 'pixi-viewport'
import * as PIXI from 'pixi.js'
import Constants from './Constants'

/**
 * Représente le fond du canvas
 */
export class World {
  background: PIXI.Sprite

  constructor(app: PIXI.Application, viewport: Viewport) {
    const wheelRenderTexture = PIXI.RenderTexture.create({
      width: Constants.tileSize * Constants.worldSize.x,
      height: Constants.tileSize * Constants.worldSize.y,
    })
    this.background = new PIXI.Sprite(wheelRenderTexture)
    viewport.addChild(this.background)

    const container = new PIXI.Container()
    for (let i = 0; i < Constants.worldSize.x; i++) {
      for (let j = 0; j < Constants.worldSize.y; j++) {
        const components = { r: 50, g: 180 + Math.random() * 8, b: 50 }

        const color = (components.r << 16) + (components.g << 8) + components.b

        const cross = new PIXI.Graphics()
        cross.beginFill(color)
        cross.drawRect(0, 0, Constants.tileSize, Constants.tileSize)
        cross.x = i * Constants.tileSize
        cross.y = j * Constants.tileSize
        container.addChild(cross)
      }
    }

    this.background.pivot.x = this.background.width / 2
    this.background.pivot.y = this.background.height / 2

    app.renderer.render(container, { renderTexture: wheelRenderTexture })
  }
}
