import type { B1 } from './B1'

export class Building {
  data: typeof B1

  constructor(buildingData: typeof B1) {
    this.data = buildingData
  }
}
