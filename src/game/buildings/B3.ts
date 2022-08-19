import type { Building } from './Building'
import type { Texture } from 'pixi.js'

export class B3 implements Building {
  static texture?: Texture

  readonly width = 2
  readonly height = 2

  readonly buildableTiles = [1, 10]

  static async loadTexture() {
    if (this.texture) return
  }

  static freeTexture() {
    this.texture?.destroy()
  }
}
