import { Building } from '@/game/buildings/Building'
import { BuildingList } from './buildings-list'

export class DestroyBuilding extends Building {
  id = 0
  label = 'Destroy'

  textureURL = new URL('/src/assets/buildings/B1/B1.png', import.meta.url).href

  width = 2
  height = 2

  buildableTiles = []

  build(x: number, y: number) {
    console.log(x, y)
  }
}

const b = new DestroyBuilding()
BuildingList[b.id] = b
