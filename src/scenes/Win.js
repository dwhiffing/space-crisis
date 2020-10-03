export default class extends Phaser.Scene {
  constructor() {
    super({ key: 'Win' })
  }

  init() {
    this.width = this.cameras.main.width
    this.height = this.cameras.main.height
  }

  create() {
    this.add
      .image(this.width / 2 - 50, this.height / 2 + 50, 'playButton')
      .setScale(1)
      .setInteractive()
      .on('pointerdown', () => {
        this.scene.start('Menu')
      })
  }

  update() {}
}
