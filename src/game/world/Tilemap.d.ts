export interface Tilemap {
  layers: Layer[]
  tilesets: Tileset[]
}

interface Layer {
  chunks: Chunk[]
}

interface Chunk {
  x: number
  y: number
  height: number
  width: number
  data: number[]
}

interface Tileset {
  name: string
  image: string
  imageheight: number
  imagewidth: number
  tilecount: number
  tileheight: number
  tilewidth: number
}
