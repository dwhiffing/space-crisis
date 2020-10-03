export default class extends Phaser.Scene {
  constructor() {
    super({ key: 'Credits' })
  }

  init(opts = {}) {
    this.width = this.cameras.main.width
    this.height = this.cameras.main.height
    this.score = opts.score || 0
  }

  create() {
    this.add
      .image(20, 20, 'exit')
      .setScale(0.5)
      .setInteractive()
      .on('pointerdown', () => {
        this.scene.start('Menu')
      })
  }

  update() {}
}
