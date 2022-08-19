import { Building } from './Building'
import type { Texture } from 'pixi.js'

export class B3 extends Building {
  static texture?: Texture

  constructor() {
    super({
      width: 2,
      height: 2,
      buildableTiles: [1, 10],
    })
  }

  static async loadTexture() {
    if (this.texture) return
  }

  static freeTexture() {
    this.texture?.destroy()
  }
}
