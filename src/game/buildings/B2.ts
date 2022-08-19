import type { Building } from './Building'
import type { Texture } from 'pixi.js'

export class B2 implements Building {
  static texture?: Texture

  readonly width = 3
  readonly height = 3

  readonly buildableTiles = [12, 29, 30, 31]

  static async loadTexture() {
    if (this.texture) return
  }

  static freeTexture() {
    this.texture?.destroy()
  }
}
