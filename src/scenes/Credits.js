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
    this.iter = 0
    this.timer = 299
    this.background = this.add
      .tileSprite(0, 0, window.innerWidth, window.innerHeight, 'background')
      .setScrollFactor(0)
    this.add
      .image(this.width - 12, this.height - 10, 'tilemap', 223)
      .setInteractive()
      .on('pointerdown', () => {
        this.scene.start('Game')
      })
    this.add
      .bitmapText(
        5,
        18,
        'pixel-dan',
        'Prevent a core breach by exploring the\nstation to uncover the secrets within\nyou have 5 minutes'.toUpperCase(),
      )
      .setFontSize(5)
      .setOrigin(0, 0.5)
    this.add
      .bitmapText(
        5,
        this.height / 2 + 5,
        'pixel-dan',
        'Arrow to move\nSpace to jump\nZ or X to shoot'.toUpperCase(),
      )
      .setFontSize(5)
      .setOrigin(0, 0.5)

    this.add
      .bitmapText(
        5,
        this.height / 2 + 30,
        'pixel-dan',
        'By Dan Whiffing \nMUSIC BY PURPLE PLANET'.toUpperCase(),
      )
      .setFontSize(5)
      .setOrigin(0, 0.5)
  }

  update(time, delta) {
    this.iter += 0.001
    this.background.tilePositionX = Math.floor(Math.cos(-this.iter) * 400)
    this.background.tilePositionY = Math.floor(Math.sin(-this.iter) * 400)
  }
}
