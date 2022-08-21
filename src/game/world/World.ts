import { useMapStore } from './../../stores/map'
import type { Tilemap, Chunk } from './Tilemap.d'
import type { Game } from '../Game'
import Constants from '../Constants'
import {
  BaseTexture,
  Container,
  Graphics,
  groupD8,
  Loader,
  Rectangle,
  RenderTexture,
  Sprite,
  Texture,
} from 'pixi.js'
import { BuildingList } from '../buildings/buildings-list'

/**
 * Représente le fond du canvas
 */
export class World {
  protected game: Game

  /**
   * Contient les chunks affichés à l'écran
   */
  protected chunks: SpriteChunk[] = []

  tilemap!: Tilemap
  get tilemapChunks() {
    return this.tilemap?.layers[0].chunks
  }

  /**
   * Permet de flip et rotate les sprites (https://pixijs.download/release/docs/PIXI.groupD8.html)
   */
  groupD4toD8: { [key: number]: number } = {
    0: 0,
    4: groupD8.MIRROR_HORIZONTAL,
    5: groupD8.N,
    6: groupD8.W,
    3: groupD8.S,
    7: groupD8.add(groupD8.MIRROR_HORIZONTAL, groupD8.N),
    2: groupD8.add(groupD8.MIRROR_HORIZONTAL, groupD8.W),
    1: groupD8.add(groupD8.MIRROR_HORIZONTAL, groupD8.S),
  }

  constructor(game: Game) {
    this.game = game
  }

  /**
   * Charge les textures depuis le serveur
   */
  async loadData() {
    try {
      const url = new URL('/src/assets/map.json', import.meta.url).href
      const data = await fetch(url)
      const tilemap = (await data.json()) as Tilemap

      const loader = new Loader()

      for (const tileset of tilemap.tilesets) {
        const url = new URL(`/src/assets/${tileset.image}`, import.meta.url).href
        loader.add(tileset.name, url)
      }

      return new Promise<void>((resolve, reject) => {
        loader.load(() => {
          this.tilemap = tilemap

          this.game.viewport.on('moved', () => this.computeChunks())
          this.computeChunks()
          loader.destroy()

          resolve()
        })

        loader.onError.add(reject)
      })
    } catch (error) {}
  }

  /**
   * calcul les chunks a afficher et re-render s'ils changent
   */
  protected computeChunks() {
    const cameraPosition = {
      x: this.game.viewport.x / this.game.viewport.scale.x,
      y: this.game.viewport.y / this.game.viewport.scale.y,
    }

    const chunkIndex = {
      x: Math.floor(-cameraPosition.x / chunkPixel),
      y: Math.floor(-cameraPosition.y / chunkPixel),
      xEnd: Math.floor((this.game.viewport.worldScreenWidth - cameraPosition.x) / chunkPixel),
      yEnd: Math.floor((this.game.viewport.worldScreenHeight - cameraPosition.y) / chunkPixel),
    }

    for (let i = chunkIndex.x; i <= chunkIndex.xEnd; i++) {
      for (let j = chunkIndex.y; j <= chunkIndex.yEnd; j++) {
        if (!this.chunks.find((chunk) => chunk.x === i && chunk.y === j)) {
          this.loadChunk(i, j)
        }
      }
    }

    for (const chunk of this.chunks) {
      if (
        chunk.x < chunkIndex.x ||
        chunk.x > chunkIndex.xEnd ||
        chunk.y < chunkIndex.y ||
        chunk.y > chunkIndex.yEnd
      ) {
        this.unloadChunk(chunk)
      }
    }
  }

  /**
   * Créé un sprite a partir du .tmj et l'ajoute au viewport et à this.chunks
   */
  async loadChunk(x: number, y: number) {
    this.unloadChunk(this.chunks.find((chunk) => chunk.x === x && chunk.y === y))

    const renderTexture = RenderTexture.create({
      width: chunkPixel + 3 * Constants.tileSize, // On prend 3 tile en plus afin d'afficher les buildings qui débordent
      height: chunkPixel + 3 * Constants.tileSize,
    })
    const container = new Container()
    this.printChunkMap(container, x, y)
    await this.printChunkBuildings(container, x, y)

    this.game.app.renderer.render(container, {
      renderTexture: renderTexture,
    })

    container.destroy()

    const sprite = new Sprite(renderTexture)
    sprite.x = x * chunkPixel
    sprite.y = y * chunkPixel
    sprite.zIndex = -x - y
    this.game.viewport.addChild(sprite)
    this.game.viewport.sortChildren()

    this.chunks.push({ x, y, sprite })
  }

  /**
   * Applique un chunk de map à un container PIXI.
   */
  protected printChunkMap(container: Container, x: number, y: number) {
    const chunkData = this.tilemapChunks.find(
      (chunk) => chunk.x === x * Constants.chunkSize && chunk.y === y * Constants.chunkSize
    )
    if (!chunkData) return

    for (let i = 0; i < chunkData.width; i++) {
      for (let j = 0; j < chunkData.height; j++) {
        const tileset = this.tilemap.tilesets[0]

        const baseTexture = BaseTexture.from(tileset.name)

        let { textureIndex, groupD8 } = this.getTileData(chunkData, i, j)

        // On ne dessine quand chunkData.data=0
        if (textureIndex && textureIndex <= tileset.tilecount && groupD8 !== undefined) {
          textureIndex -= 1 // On fait commencer à 0 pour que ce soit plus simple

          // Position de la texture dans le .png
          const tilePosition = {
            x: (tileset.tilewidth * textureIndex) % tileset.imagewidth,
            y:
              Math.floor((tileset.tilewidth * textureIndex) / tileset.imagewidth) *
              tileset.tileheight,
          }

          const texture = new Texture(
            baseTexture,
            new Rectangle(tilePosition.x, tilePosition.y, tileset.tilewidth, tileset.tileheight),
            undefined,
            undefined,
            groupD8
          )

          const sprite = new Sprite(texture)
          sprite.position = {
            x: tileset.tilewidth * i,
            y: tileset.tileheight * j,
          }
          container.addChild(sprite)
        }
      }
    }
  }

  /**
   * Applique tous les buildings d'un chunk.
   */
  protected async printChunkBuildings(container: Container, x: number, y: number) {
    const chunk = useMapStore().chunks.find(
      (chunkInList) => chunkInList.x === x && chunkInList.y === y
    )
    if (!chunk) return

    for (const building of chunk.data) {
      const buildingData = BuildingList[building.buildingID]
      if (buildingData) {
        const baseTexture = await buildingData.getTexture()

        const texture = new Texture(
          baseTexture,
          new Rectangle(
            0,
            0,
            buildingData.width * Constants.tileSize,
            buildingData.height * Constants.tileSize
          )
        )

        // Position dans le chunk
        let chunkI = building.x % Constants.chunkSize
        let chunkJ = building.y % Constants.chunkSize
        if (chunkI < 0) chunkI += Constants.chunkSize
        if (chunkJ < 0) chunkJ += Constants.chunkSize

        const sprite = new Sprite(texture)
        sprite.position = {
          x: chunkI * Constants.tileSize,
          y: chunkJ * Constants.tileSize,
        }
        container.addChild(sprite)
      }
    }
  }

  /**
   * Supprime un chunk ainsi que son sprite
   */
  protected unloadChunk(chunk?: SpriteChunk) {
    if (!chunk) return
    this.game.viewport.removeChild(chunk.sprite)
    chunk.sprite.destroy(true)
    this.chunks.splice(this.chunks.indexOf(chunk), 1)
  }

  getGridPostition(pos: { x: number; y: number }) {
    return {
      x: pos.x / Constants.tileSize,
      y: pos.y / Constants.tileSize,
    }
  }

  getTileData(chunkData: Chunk, x: number, y: number) {
    const data = chunkData.data[y * chunkData.width + (x % chunkData.width)]
    // les premiers bit servent à trouver le bon sprite
    let textureIndex = data & 65535

    // les 4 derniers servent à la rotation
    const groupD8 = this.groupD4toD8[data >>> 29]

    return {
      textureIndex,
      groupD8,
    }
  }
}

const chunkPixel = Constants.tileSize * Constants.chunkSize

interface SpriteChunk {
  x: number
  y: number
  sprite: Sprite
}
