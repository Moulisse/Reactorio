abstract class IBuilding {
  width!: number
  height!: number
  buildableTiles!: number[]
}

export class Building extends IBuilding {
  constructor(data: IBuilding) {
    super()
    this.width = data.width
    this.height = data.height
    this.buildableTiles = data.buildableTiles
  }
  build(pos: { x: number; y: number }) {}
}
