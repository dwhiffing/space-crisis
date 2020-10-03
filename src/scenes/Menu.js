export default class extends Phaser.Scene {
  constructor() {
    super({ key: 'Menu' })
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
        this.scene.start('Game')
      })
    this.add
      .image(this.width / 2 + 50, this.height / 2 + 50, 'helpButton')
      .setScale(1)
      .setInteractive()
      .on('pointerdown', () => {
        this.scene.start('Credits')
      })
  }

  update() {}
}
