import { B1 } from './../game/buildings/B1'
import { Game } from './../game/Game'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { useMapStore } from './map'
import { Building } from '@/game/buildings/Building'

export const useGameStore = defineStore({
  id: 'game',
  state: (): { game?: Game } => ({
    game: undefined,
  }),
  actions: {
    create(canvas: HTMLElement) {
      this.game = new Game(canvas)
      useMapStore().checkLand(0, 0, new Building(B1)) // TODO delete
      return this.game
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useGameStore, import.meta.hot))
}
