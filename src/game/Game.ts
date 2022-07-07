import { Viewport } from 'pixi-viewport'
import { Application, SCALE_MODES, settings } from 'pixi.js'
import Constants from './Constants'
import { World } from './world/World'

export class Game {
  app: Application

  viewport: Viewport

  world: World

  constructor(canvas: HTMLElement) {
    settings.SCALE_MODE = SCALE_MODES.NEAREST

    this.app = new Application({
      resizeTo: window,
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
      .drag({
        mouseButtons: 'left',
      })
      .wheel({
        smooth: 10,
      })
      .decelerate({
        friction: 0.9,
        minSpeed: 0.01,
      })
      .setZoom(3)
      .moveCenter(Constants.tileSize * 14, Constants.tileSize * 5)

    this.world = new World(this)
    this.world.loadData()
  }

  changeCursorMode(cursorMode: string) {
    this.app.renderer.plugins.interaction.cursorStyles.default = cursorMode
    this.app.renderer.plugins.interaction.setCursorMode(cursorMode)
  }
}
