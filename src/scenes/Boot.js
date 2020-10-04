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
        0,
        this.sys.game.config.width * value,
        this.sys.game.config.height,
      )
    })

    this.load.audio('upgrade', 'assets/audio/upgrade.wav', { instances: 3 })
    this.load.audio('music', 'assets/audio/music.mp3')
    this.load.audio('missile', 'assets/audio/missile.wav', { instances: 3 })
    this.load.audio('missile-explode', 'assets/audio/explode2.wav', {
      instances: 3,
    })
    this.load.audio('pickup', 'assets/audio/pickup.wav', { instances: 3 })
    this.load.audio('enemyDead', 'assets/audio/enemyDead.wav', { instances: 3 })
    this.load.audio('charge2', 'assets/audio/charge2.wav', { instances: 3 })
    this.load.audio('charge', 'assets/audio/charge.wav', { instances: 3 })
    this.load.audio('not-available', 'assets/audio/not-available.wav', {
      instances: 3,
    })
    this.load.audio('hit2', 'assets/audio/hit2.wav', { instances: 3 })
    this.load.audio('hit', 'assets/audio/hit1.wav', { instances: 3 })
    this.load.audio('shoot', 'assets/audio/shoot.wav', { instances: 3 })
    this.load.audio('jump', 'assets/audio/jump.wav', { instances: 1 })
    this.load.bitmapFont(
      'pixel-dan',
      'assets/pixel-dan.png',
      'assets/pixel-dan.xml',
    )
    this.load.tilemapTiledJSON(`map`, `assets/maps/map.json`)
    this.load.image('background', 'assets/images/background.png')
    this.load.image('title', 'assets/images/title.png')
    this.load.spritesheet('tilemap', 'assets/images/tilemap.png', {
      frameWidth: 16,
      frameHeight: 16,
    })

    this.load.on('complete', () => {
      progress.destroy()
      this.scene.start('Menu')
      this.sound.play('music', { loop: true, volume: 0.5 })
      // this.scene.start('Game')
    })
  }
}
