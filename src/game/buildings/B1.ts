import { Building } from './Building'
import type { Texture } from 'pixi.js'

export class B1 extends Building {
  static texture?: Texture

  constructor() {
    super({
      width: 1,
      height: 2,
      buildableTiles: [12, 29, 30, 31],
    })
  }

  static async loadTexture() {
    if (this.texture) return
  }

  static freeTexture() {
    this.texture?.destroy()
  }
}
