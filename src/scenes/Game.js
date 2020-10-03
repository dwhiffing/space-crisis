import InputService from '../services/input'
import LevelService from '../services/level'

export default class extends Phaser.Scene {
  constructor() {
    super({ key: 'Game' })
  }

  create() {
    this.iter = 0
    this.timer = 299
    this.background = this.add
      .tileSprite(0, 0, 1920, 1080, 'background')
      .setScrollFactor(0)
      .setTint(0xe86a17)

    this.healthText = this.add
      .text(20, 20, '100')
      .setScrollFactor(0)
      .setDepth(999)

    this.timerText = this.add
      .text(20, 40, this.timer + 1)
      .setScrollFactor(0)
      .setDepth(999)

    this.time.addEvent({
      delay: 1000,
      repeat: -1,
      callback: () => {
        if (this.timer < 0) {
          this.scene.start('Game')
        }
        if (this.timer >= 0) this.timerText.setText(this.timer--)
      },
    })

    this.ammoText = this.add.text(100, 20, '5').setScrollFactor(0).setDepth(999)

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
