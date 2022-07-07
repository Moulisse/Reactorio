import { Graphics, type Texture } from 'pixi.js'

export class B1 {
  mesh: Graphics

  static texture?: Texture

  constructor() {
    this.mesh = new Graphics()

    this.mesh
      .beginFill(0xffffff)
      .moveTo(15, 5)
      .lineTo(15, 13)
      .arc(13, 13, 2, 0, Math.PI / 2, false)
      .lineTo(5, 15)
      .arc(5, 16.5, 1.5, -Math.PI / 2, Math.PI / 2, true)
      .lineTo(14, 18)
      .arc(14, 14, 4, Math.PI / 2, 0, true)
      .lineTo(18, 5)
      .arc(16.5, 5, 1.5, 0, Math.PI, true)
  }

  static async loadTexture() {
    if (this.texture) return
  }

  static freeTexture() {
    this.texture?.destroy()
  }
}
