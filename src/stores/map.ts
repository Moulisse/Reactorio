import type { Chunk } from './../game/world/Tilemap.d'
import type { Building } from '../game/buildings/Building'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { useGameStore } from './game'
import Constants from '@/game/Constants'

export const useMapStore = defineStore({
  id: 'map',
  state: (): { chunks: Chunk[] } => ({ chunks: [] }),
  actions: {
    /**
     * Place un nouveau batiment sur la grille de jeu.
     */
    build(building: Building, pos: { x: number; y: number }) {
      const gameStore = useGameStore()

      if (gameStore.game?.world.checkLand(pos.x, pos.y, building)) {
        console.log('build')

        const chunkX = Math.floor(pos.x / Constants.chunkSize) * Constants.chunkSize
        const chunkY = Math.floor(pos.y / Constants.chunkSize) * Constants.chunkSize

        let chunkData = this.chunks.find((chunk) => chunk.x === chunkX && chunk.y === chunkY)
        if (!chunkData) {
          chunkData = {
            x: chunkX,
            y: chunkY,
            height: Constants.chunkSize,
            width: Constants.chunkSize,
            data: new Array(Constants.chunkSize * Constants.chunkSize).fill(0),
          }
          this.chunks.push(chunkData)
        }
      }
    },
  },
  persist: true,
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMapStore, import.meta.hot))
}
