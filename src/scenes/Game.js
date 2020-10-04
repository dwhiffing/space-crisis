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
      .tileSprite(0, 0, window.innerWidth, window.innerHeight, 'background')
      .setScrollFactor(0)
      .setScale(1)
    this.background2 = this.add
      .graphics(0, 0)
      .fillStyle(0x181425)
      .fillRect(0, 0, this.cameras.main.width, 18)
      .fillStyle(0x3a4466)
      .fillRect(1, 1, this.cameras.main.width - 2, 16)
      .fillStyle(0x181425)
      .fillRect(2, 2, this.cameras.main.width - 4, 14)
      .setScrollFactor(0)
      .setDepth(998)

    this.healthText = this.add
      .bitmapText(20, 7, 'pixel-dan', '100')
      .setScrollFactor(0)
      .setDepth(999)

    this.ammoText = this.add
      .bitmapText(60, 7, 'pixel-dan', '5')
      .setScrollFactor(0)
      .setDepth(999)

    this.timerText = this.add
      .bitmapText(this.cameras.main.width - 20, 7, 'pixel-dan', this.timer + 1)
      .setScrollFactor(0)
      .setDepth(999)

    this.upgradeText = this.add
      .bitmapText(10, this.cameras.main.height - 10, 'pixel-dan', '')
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

    this.level = new LevelService(this, 'map')
    this.inputService = new InputService(this)
  }

  update(time, delta) {
    this.iter += 0.001
    this.background.tilePositionX = Math.floor(Math.cos(-this.iter) * 400)
    this.background.tilePositionY = Math.floor(Math.sin(-this.iter) * 400)
    this.inputService.update(time, delta)
    this.level.update(time, delta)
    this.level.player.update()
  }
}
