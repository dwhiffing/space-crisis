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

    this.add
      .text(
        this.width / 2,
        this.height / 2 - 40,
        'Prevent a core shutdown by exploring the station to uncover the secrets within',
        { wordWrap: { width: 800, useAdvancedWrap: true } },
      )
      .setOrigin(0.5)
      .setFontSize(40)

    this.add
      .text(this.width / 2, this.height / 2 + 80, 'By Daniel Whiffing')
      .setOrigin(0.5)
      .setFontSize(40)
  }

  update() {}
}
