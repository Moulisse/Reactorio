import type { Game } from './Game'
import * as PIXI from 'pixi.js'
import Constants from './Constants'

/**
 * Représente le fond du canvas
 */
export class World {
  background: PIXI.Sprite
  protected chunks: Chunk[] = []

  protected game: Game

  constructor(game: Game) {
    this.game = game

    this.background = new PIXI.Sprite()
    game.viewport.addChild(this.background)

    this.game.viewport.on('moved', () => this.computeChunks())
    this.computeChunks()
  }

  /**
   * calcul les chunks a afficher et re-render s'ils changent
   */
  computeChunks() {
    // console.log(this.game.viewport.worldScreenWidth)

    const cameraPosition = {
      x: this.game.viewport.x / this.game.viewport.scale.x,
      y: this.game.viewport.y / this.game.viewport.scale.y,
    }

    const chunkIndex = {
      x: Math.floor(-cameraPosition.x / chunkPixel),
      y: Math.floor(-cameraPosition.y / chunkPixel),
      xEnd: Math.floor((this.game.viewport.worldScreenWidth - cameraPosition.x) / chunkPixel),
      yEnd: Math.floor((this.game.viewport.worldScreenHeight - cameraPosition.y) / chunkPixel),
    }

    for (let i = chunkIndex.x; i <= chunkIndex.xEnd; i++) {
      for (let j = chunkIndex.y; j <= chunkIndex.yEnd; j++) {
        if (!this.chunks.find((chunk) => chunk.x === i && chunk.y === j)) {
          this.loadChunk(i, j)
        }
      }
    }

    for (const chunk of this.chunks) {
      if (
        chunk.x < chunkIndex.x ||
        chunk.x > chunkIndex.xEnd ||
        chunk.y < chunkIndex.y ||
        chunk.y > chunkIndex.yEnd
      ) {
        this.unloadChunk(chunk)
      }
    }
  }

  protected loadChunk(x: number, y: number) {
    const renderTexture = PIXI.RenderTexture.create({
      width: chunkPixel,
      height: chunkPixel,
    })
    const container = new PIXI.Container()

    for (let i = 0; i < Constants.chunkSize; i++) {
      for (let j = 0; j < Constants.chunkSize; j++) {
        const components = { r: 50, g: 0 + Math.random() * 255, b: 50 }
        const color = (components.r << 16) + (components.g << 8) + components.b
        const cross = new PIXI.Graphics()
        cross.beginFill(color)
        cross.drawRect(
          Constants.tileSize * i,
          Constants.tileSize * j,
          Constants.tileSize,
          Constants.tileSize
        )

        container.addChild(cross)
      }
    }

    this.game.app.renderer.render(container, {
      renderTexture: renderTexture,
    })

    container.destroy(true)

    const sprite = new PIXI.Sprite(renderTexture)
    sprite.x = x * chunkPixel
    sprite.y = y * chunkPixel
    this.game.viewport.addChild(sprite)

    this.chunks.push({ x, y, sprite })
  }

  protected unloadChunk(chunk: Chunk) {
    if (!chunk) return
    this.game.viewport.removeChild(chunk.sprite)
    chunk.sprite.destroy(true)
    this.chunks.splice(this.chunks.indexOf(chunk), 1)
  }

  getGridPostition(pos: { x: number; y: number }) {
    return {
      x: pos.x / Constants.tileSize,
      y: pos.y / Constants.tileSize,
    }
  }
}

const chunkPixel = Constants.tileSize * Constants.chunkSize

interface Chunk {
  x: number
  y: number
  sprite: PIXI.Sprite
}
