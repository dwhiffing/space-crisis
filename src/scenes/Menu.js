export default class extends Phaser.Scene {
  constructor() {
    super({ key: 'Menu' })
  }

  init() {
    this.width = this.cameras.main.width
    this.height = this.cameras.main.height
  }

  create() {
    this.iter = 0
    this.timer = 299
    this.background = this.add
      .tileSprite(0, 0, window.innerWidth, window.innerHeight, 'background')
      .setScrollFactor(0)
    this.add.image(this.width / 2, this.height / 2 - 10, 'title').setScale(0.5)
    this.add
      .image(this.width / 2 - 15, this.height - 10, 'tilemap', 223)
      .setInteractive()
      .on('pointerdown', () => {
        this.sound.muted = true
        this.scene.start('Game')
      })
    this.add
      .image(this.width / 2 + 15, this.height - 10, 'tilemap', 224)
      .setInteractive()
      .on('pointerdown', () => {
        this.scene.start('Credits')
      })
  }

  update(time, delta) {
    this.iter += 0.001
    this.background.tilePositionX = Math.floor(Math.cos(-this.iter) * 400)
    this.background.tilePositionY = Math.floor(Math.sin(-this.iter) * 400)
  }
}
