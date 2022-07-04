import { Viewport } from 'pixi-viewport'
import * as PIXI from 'pixi.js'
import { World } from './World'

export class Game {
  app: PIXI.Application

  viewport: Viewport

  world: World

  constructor(canvas: HTMLElement) {
    this.app = new PIXI.Application({
      resizeTo: window,
      antialias: true,
    })
    canvas.appendChild(this.app.view)

    // create viewport
    this.viewport = new Viewport({
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      worldWidth: 1000,
      worldHeight: 1000,

      interaction: this.app.renderer.plugins.interaction,
    })

    // add the viewport to the stage
    this.app.stage.addChild(this.viewport)

    // activate plugins
    this.viewport
      .drag()
      .wheel({
        smooth: 10,
      })
      .decelerate({
        friction: 0.9,
        minSpeed: 0.01,
      })
      .moveCenter(0, 0)

    this.world = new World(this.app, this.viewport)
  }
}
