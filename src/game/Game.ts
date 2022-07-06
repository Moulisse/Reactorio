import { Viewport } from 'pixi-viewport'
import { Application, SCALE_MODES, settings } from 'pixi.js'
import { World } from './World'

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
      .moveCenter(0, 0)

    this.world = new World(this)
  }

  changeCursorMode(cursorMode: string) {
    this.app.renderer.plugins.interaction.cursorStyles.default = cursorMode
    this.app.renderer.plugins.interaction.setCursorMode(cursorMode)
  }
}
