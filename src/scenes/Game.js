import InputService from '../services/input'
import LevelService from '../services/level'

export default class extends Phaser.Scene {
  constructor() {
    super({ key: 'Game' })
  }

  create() {
    this.iter = 0
    this.background = this.add
      .tileSprite(0, 0, 1920, 1080, 'background')
      .setScrollFactor(0)
      .setTint(0xe86a17)

    this.level = new LevelService(this, 'map')
    this.inputService = new InputService(this)
  }

  update(time, delta) {
    this.iter += 0.001
    this.background.tilePositionX = Math.cos(-this.iter) * 400
    this.background.tilePositionY = Math.sin(-this.iter) * 400
    this.inputService.update(time, delta)
    this.level.player.update()
  }
}
