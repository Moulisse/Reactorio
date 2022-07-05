import { Game } from './../game/Game'
import { acceptHMRUpdate, defineStore } from 'pinia'

export const useGameStore = defineStore({
  id: 'game',
  state: (): { game?: Game } => ({
    game: undefined,
  }),
  actions: {
    create(canvas: HTMLElement) {
      this.game = new Game(canvas)
      return this.game
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useGameStore, import.meta.hot))
}
