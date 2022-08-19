import type { Texture } from 'pixi.js'

export abstract class B1 {
  static id = 1

  static texture?: Texture

  static width = 1
  static height = 2

  static buildableTiles = [12, 29, 30, 31]

  static async loadTexture() {
    if (this.texture) return
  }

  static freeTexture() {
    this.texture?.destroy()
  }
}
