import { filters } from 'pixi.js'

const tint = 0xff0000
const r = (tint >> 16) & 0xff
const g = (tint >> 8) & 0xff
const b = tint & 0xff
export const redFilter = new filters.ColorMatrixFilter()
redFilter.matrix[0] = r / 255
redFilter.matrix[6] = g / 255
redFilter.matrix[12] = b / 255
