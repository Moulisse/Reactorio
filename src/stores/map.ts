import { BuildingList } from './../game/buildings/buildings-list'
import type { Building } from '../game/buildings/Building'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { useGameStore } from './game'
import Constants from '@/game/Constants'
import type { Chunk } from '@/game/world/Tilemap'

export const useMapStore = defineStore({
  id: 'map',
  state: (): {
    // Une liste de buildings a persister dans le localstorage
    chunks: BuildingsChunk[]
    // Une map de number recalculée a chaque fois servant a tester le terrain
    mapChunks: Chunk[]
  } => {
    return { chunks: [], mapChunks: [] }
  },
  actions: {
    /**
     * Check si un rectangle est constructible
     */
    checkLand(x: number, y: number, building: Building): boolean {
      const world = useGameStore().game?.world
      if (!world) return false

      if (building.buildableTiles.length === 0) return true

      for (let i = x; i < x + building.width; i++) {
        for (let j = y; j < y + building.height; j++) {
          // Position dans le chunk
          let chunkI = i % Constants.chunkSize
          let chunkJ = j % Constants.chunkSize
          if (chunkI < 0) chunkI += Constants.chunkSize
          if (chunkJ < 0) chunkJ += Constants.chunkSize

          // Check de la Map
          let chunkData = world.tilemapChunks?.find(
            (chunk) =>
              chunk.x === Math.floor(i / Constants.chunkSize) * Constants.chunkSize &&
              chunk.y === Math.floor(j / Constants.chunkSize) * Constants.chunkSize
          )
          if (!chunkData) return false

          let { textureIndex } = world.getTileData(chunkData, chunkI, chunkJ)

          if (building.buildableTiles.indexOf(textureIndex) < 0) {
            return false
          }

          // Check de la BuildingMap
          chunkData = this.mapChunks.find(
            (chunk) =>
              chunk.x === Math.floor(i / Constants.chunkSize) * Constants.chunkSize &&
              chunk.y === Math.floor(j / Constants.chunkSize) * Constants.chunkSize
          )
          if (chunkData && chunkData.data[i * chunkData.width + (j % chunkData.width)] > 0) {
            return false
          }
        }
      }

      return true
    },

    /**
     * Rebuild mapChunk avec les nouveaux Buildings
     */
    rebuildMap() {
      for (const chunk of this.chunks) {
        for (const building of chunk.data) {
          const buildingData = BuildingList[building.buildingID]

          if (buildingData) {
            for (let i = building.x; i < building.x + buildingData.width; i++) {
              for (let j = building.y; j < building.y + buildingData.height; j++) {
                const chunkX = Math.floor(i / Constants.chunkSize) * Constants.chunkSize
                const chunkY = Math.floor(j / Constants.chunkSize) * Constants.chunkSize

                let mapChunk = this.mapChunks.find(
                  (chunk) => chunk.x === chunkX && chunk.y === chunkY
                )

                if (!mapChunk) {
                  mapChunk = {
                    x: chunkX,
                    y: chunkY,
                    height: Constants.chunkSize,
                    width: Constants.chunkSize,
                    data: new Array(Constants.chunkSize * Constants.chunkSize).fill(0),
                  }
                  this.mapChunks.push(mapChunk)
                }

                mapChunk.data[i * mapChunk.width + (j % mapChunk.width)] = building.buildingID
              }
            }
          }
        }
      }
    },
  },
  persist: {
    paths: ['chunks'],
    afterRestore: (ctx) => ctx.store.rebuildMap(),
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMapStore, import.meta.hot))
}

/**
 * Contient une liste de Buildings, a l'inverse de Chunk qui utilise un tableau de number
 */
interface BuildingsChunk {
  /**
   * Index de chunk (comme pour la tilemap)
   */
  x: number
  y: number
  data: {
    /**
     * Coordonnées dans le monde
     */
    x: number
    y: number
    buildingID: number
  }[]
}
