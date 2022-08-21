import { Building } from '@/game/buildings/Building'
import { BuildingList } from './buildings-list'

export class B1 extends Building {
  id = 1
  label = 'Small house'

  textureURL = new URL(`/src/assets/buildings/B1/B1.png`, import.meta.url).href

  width = 2
  height = 2
}

const b = new B1()
BuildingList[b.id] = b
