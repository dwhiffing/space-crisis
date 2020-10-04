export default class extends Phaser.Scene {
  constructor() {
    super({ key: 'Boot' })
  }

  preload() {
    const progress = this.add.graphics()
    this.load.on('progress', (value) => {
      progress.clear()
      progress.fillStyle(0xffffff, 1)
      progress.fillRect(
        0,
        this.sys.game.config.height / 2,
        this.sys.game.config.width * value,
        60,
      )
    })

    this.load.bitmapFont(
      'pixel-dan',
      'assets/pixel-dan.png',
      'assets/pixel-dan.xml',
    )
    this.load.tilemapTiledJSON(`map`, `assets/maps/map.json`),
      this.load.image('background', 'assets/images/background.png')
    this.load.spritesheet('tilemap', 'assets/images/tilemap.png', {
      frameWidth: 16,
      frameHeight: 16,
    })

    this.load.on('complete', () => {
      progress.destroy()
      // this.scene.start('Menu')
      this.scene.start('Game')
    })
  }
}
