import { useGameStore } from '@/stores/game'
import { BaseTexture, Loader } from 'pixi.js'
import Constants from '../Constants'
import { useMapStore } from './../../stores/map'

export class Building {
  width = 1
  height = 1
  buildableTiles = [12, 29, 30, 31]

  private texture?: BaseTexture
  private texturePromise?: Promise<BaseTexture>

  async getTexture() {
    if (!this.textureURL) return
    if (this.texture) return this.texture
    if (this.texturePromise) return this.texturePromise

    const loader = new Loader()

    loader.add(this.label, this.textureURL)

    return (this.texturePromise = new Promise<BaseTexture>((resolve, reject) => {
      loader.load(() => {
        loader.destroy()
        this.texture = BaseTexture.from(this.label)
        resolve(this.texture)
      })

      loader.onError.add(reject)
    }))
  }

  freeTexture() {
    this.texture?.destroy()
  }

  /**
   * Place un nouveau batiment sur la grille de jeu.
   */
  build(x: number, y: number) {
    const mapStore = useMapStore()
    const gameStore = useGameStore()

    if (mapStore.checkLand(x, y, this)) {
      const chunkX = Math.floor(x / Constants.chunkSize)
      const chunkY = Math.floor(y / Constants.chunkSize)

      let chunk = mapStore.chunks.find((chunk) => chunk.x === chunkX && chunk.y === chunkY)
      if (!chunk) {
        chunk = {
          x: chunkX,
          y: chunkY,
          data: [],
        }
        mapStore.chunks.push(chunk)
      }
      chunk.data.push({
        x,
        y,
        buildingID: this.id,
      })
      mapStore.rebuildMap()
      const world = gameStore.game?.world
      world?.loadChunk(chunk.x, chunk.y)
    }
  }
}

export interface Building {
  id: number
  label: string
  textureURL: string
}
