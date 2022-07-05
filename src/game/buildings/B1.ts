import * as PIXI from 'pixi.js'
// import * as TiledMap from 'tiled-to-pixi'
import imgUrl from '/src/assets/revolution/revolution_tiles.png'
import { XMLParser } from 'fast-xml-parser'

export class B1 {
  mesh: PIXI.Graphics

  static texture?: PIXI.Texture

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

  static async loadTexture() {
    if (this.texture) return

    return new Promise((resolve, reject) => {
      const url = new URL('/src/assets/map.tmx', import.meta.url).href
      const xhr = new XMLHttpRequest()

      xhr.onload = function () {
        if (!xhr.responseXML) return

        const parser = new XMLParser()
        const map = parser.parse(xhr.responseXML.documentElement.outerHTML)
        resolve(map)
      }

      xhr.onerror = function () {
        reject(new Error('Cannot load : ' + url))
      }

      xhr.open('GET', url)
      xhr.responseType = 'document'
      xhr.send()
    })

    // const loader = new PIXI.Loader()

    // loader
    //   .add(imgUrl) // Tileset to render both maps
    //   // .use(TiledMap.middleware)
    //   .load((_loader, resources) => {
    //     // Generate the containers for both maps
    //     // let map1 = new TiledMap('TestMap1')

    //     this.texture = resources[imgUrl].texture

    //     // const bunny = new PIXI.TilingSprite(resources.tilemap.texture)
    //   })

    // loader.destroy()
  }

  static freeTexture() {
    this.texture?.destroy()
  }
}
