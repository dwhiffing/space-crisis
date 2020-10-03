export default class InputService {
  constructor(scene) {
    this.scene = scene
    this.jump = this.jump.bind(this)
    this.makeButton = this.makeButton.bind(this)
    this.keyReleased = this.keyReleased.bind(this)
    this.leftPressed = this.leftPressed.bind(this)
    this.rightPressed = this.rightPressed.bind(this)
    this.cleanup = this.cleanup.bind(this)
    this.update = this.update.bind(this)
    this.upPressed = this.upPressed.bind(this)
    this.downPressed = this.downPressed.bind(this)

    const DISTX = 50
    const DISTY = 70
    const { height, width } = this.scene.cameras.main

    this.direction = 0
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      this.leftTouch = this.makeButton(
        DISTX,
        height - DISTY,
        'left',
        this.leftPressed,
      )
      this.upTouch = this.makeButton(
        DISTX * 1.75,
        height - DISTY * 1.6,
        'up',
        this.upPressed,
      )
      this.downTouch = this.makeButton(
        DISTX * 1.75,
        height - DISTY + DISTY * 0.6,
        'down',
        this.downPressed,
      )
      this.rightTouch = this.makeButton(
        DISTX * 2.5,
        height - DISTY,
        'right',
        this.rightPressed,
      )
      this.leftTouch.on('pointerup', this.keyReleased)
      this.downTouch.on('pointerup', this.keyReleased)
      this.upTouch.on('pointerup', this.keyReleased)
      this.rightTouch.on('pointerup', this.keyReleased)
      this.makeButton(width - DISTX, height - DISTY, 'jump', this.jump)
    }

    this.cursors = this.scene.input.keyboard.createCursorKeys()
    this.spaceKey = this.scene.input.keyboard.addKey('SPACE')
    this.zKey = this.scene.input.keyboard.addKey('Z')
    this.xKey = this.scene.input.keyboard.addKey('X')

    this.cursors.up.addListener('down', this.upPressed)
    this.cursors.left.addListener('down', this.leftPressed)
    this.cursors.right.addListener('down', this.rightPressed)
    this.cursors.down.addListener('down', this.downPressed)
    this.cursors.down.addListener('up', this.keyReleased)
    this.cursors.up.addListener('up', this.keyReleased)
    this.cursors.left.addListener('up', this.keyReleased)
    this.cursors.right.addListener('up', this.keyReleased)
    this.zKey.addListener('down', this.jump)
    this.spaceKey.addListener('down', this.jump)
  }

  leftPressed() {
    this.direction = -1
  }

  rightPressed() {
    this.direction = 1
  }

  upPressed() {
    this.direction = 2
  }

  downPressed() {
    this.direction = 3
  }

  keyReleased() {
    this.direction = 0
  }

  jump() {
    this.scene.activePlayer.action()
  }

  cleanup() {
    this.cursors.up.removeListener('down')
    this.cursors.left.removeListener('down')
    this.cursors.right.removeListener('down')
    this.cursors.down.removeListener('down')
    this.zKey.removeListener('down')
    this.spaceKey.removeListener('down')
    this.cursors.down.removeListener('up')
    this.cursors.up.removeListener('up')
    this.cursors.left.removeListener('up')
    this.cursors.right.removeListener('up')
  }

  makeButton(x, y, key, callback, scale = 0.7) {
    const image = this.scene.add.image(x, y, key)
    image
      .setScale(scale)
      .setInteractive()
      .setScrollFactor(0)
      .setDepth(10)
      .on('pointerdown', callback)
    return image
  }

  update() {
    if (this.direction === 1 || this.direction === -1) {
      this.scene.activePlayer.walk(this.direction)
    } else {
      this.scene.activePlayer.stop()
    }
  }
}
