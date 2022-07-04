import * as PIXI from 'pixi.js'
// import * as TiledMap from 'tiled-to-pixi'
import imgUrl from '/src/assets/revolution/revolution_tiles.png'

export class B1 {
  mesh: PIXI.Graphics

  texture: unknown

  constructor() {
    this.mesh = new PIXI.Graphics()

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

  static loadTexture() {
    PIXI.Loader.shared
      .add(imgUrl) // Tileset to render both maps
      // .use(TiledMap.middleware)
      .load(function (loader, resources) {
        // Generate the containers for both maps
        // let map1 = new TiledMap('TestMap1')

        console.log(resources[imgUrl].texture)

        // const bunny = new PIXI.TilingSprite(resources.tilemap.texture)
      })
  }

  static freeTexture() {}
}
