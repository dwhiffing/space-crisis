export default class InputService {
  constructor(scene) {
    this.scene = scene
    this.jumpPressed = this.jumpPressed.bind(this)
    this.jumpReleased = this.jumpReleased.bind(this)
    this.missilePressed = this.missilePressed.bind(this)
    this.missileReleased = this.missileReleased.bind(this)
    this.shootPressed = this.shootPressed.bind(this)
    this.shootReleased = this.shootReleased.bind(this)
    this.makeButton = this.makeButton.bind(this)
    this.cleanup = this.cleanup.bind(this)
    this.update = this.update.bind(this)
    this.upPressed = this.upPressed.bind(this)
    this.downPressed = this.downPressed.bind(this)
    this.leftPressed = this.leftPressed.bind(this)
    this.rightPressed = this.rightPressed.bind(this)
    this.upReleased = this.upReleased.bind(this)
    this.downReleased = this.downReleased.bind(this)
    this.leftReleased = this.leftReleased.bind(this)
    this.rightReleased = this.rightReleased.bind(this)

    this.player = this.scene.level.player

    const DISTX = 18
    const DISTY = 20
    const { height, width } = this.scene.cameras.main

    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      this.leftTouch = this.makeButton(
        DISTX,
        height - DISTY,
        216,
        this.leftPressed,
        this.leftReleased,
      )
      this.upTouch = this.makeButton(
        DISTX * 1.8,
        height - DISTY * 1.6,
        213,
        this.upPressed,
        this.upReleased,
      )
      this.downTouch = this.makeButton(
        DISTX * 1.8,
        height - DISTY + DISTY * 0.6,
        215,
        this.downPressed,
        this.downReleased,
      )
      this.rightTouch = this.makeButton(
        DISTX * 2.6,
        height - DISTY,
        214,
        this.rightPressed,
        this.rightReleased,
      )
      this.makeButton(
        width - DISTX,
        height - DISTY,
        217,
        this.jumpPressed,
        this.jumpReleased,
      )
      this.makeButton(
        width - DISTX * 2,
        height - DISTY,
        218,
        this.shootPressed,
        this.shootReleased,
      )
      this.makeButton(
        width - DISTX * 3,
        height - DISTY,
        219,
        this.missilePressed,
        this.missileReleased,
      )
    }

    this.cursors = this.scene.input.keyboard.createCursorKeys()
    this.spaceKey = this.scene.input.keyboard.addKey('SPACE')
    this.zKey = this.scene.input.keyboard.addKey('Z')
    this.xKey = this.scene.input.keyboard.addKey('X')
    this.rKey = this.scene.input.keyboard.addKey('R')

    this.cursors.up.addListener('down', this.upPressed)
    this.cursors.left.addListener('down', this.leftPressed)
    this.cursors.right.addListener('down', this.rightPressed)
    this.cursors.down.addListener('down', this.downPressed)
    this.cursors.down.addListener('up', this.downReleased)
    this.cursors.up.addListener('up', this.upReleased)
    this.cursors.left.addListener('up', this.leftReleased)
    this.cursors.right.addListener('up', this.rightReleased)
    this.zKey.addListener('down', this.shootPressed)
    this.zKey.addListener('up', this.shootReleased)
    this.xKey.addListener('down', this.missilePressed)
    this.xKey.addListener('up', this.missileReleased)
    this.rKey.addListener('down', () => {
      this.scene.sound.mute = true
      const scene = this.scene
      scene.scene.restart()
    })
    this.spaceKey.addListener('down', this.jumpPressed)
    this.spaceKey.addListener('up', this.jumpReleased)

    this.chargeSound = this.scene.sound.add('charge2', {
      rate: 0.5,
      volume: 0.5,
      loop: true,
    })
  }

  leftPressed() {
    this.player.direction.left = true
  }
  leftReleased() {
    this.player.direction.left = false
  }

  rightPressed() {
    this.player.direction.right = true
  }
  rightReleased() {
    this.player.direction.right = false
  }

  upPressed() {
    this.player.direction.up = true
  }
  upReleased() {
    this.player.direction.up = false
  }

  downPressed() {
    this.player.direction.down = true
  }
  downReleased() {
    this.player.direction.down = false
  }

  jumpPressed() {
    this.shouldTriggerJumpOnRelease = true
    this.player.direction.jump = true
    this.jumpTime = +new Date()
    this.scene.time.addEvent({
      delay: 150,
      callback: this.jumpReleased,
    })
  }
  jumpReleased() {
    if (!this.shouldTriggerJumpOnRelease) return

    this.shouldTriggerJumpOnRelease = false
    this.player.direction.jump = false
    this.player.jump(+new Date() - this.jumpTime)
  }

  shootPressed() {
    // charge shot
    if (this.player.unlocks.gun >= 3) {
      this.shootTime = +new Date()
      let tint = 1
      this.cb = this.scene.time.addEvent({
        delay: 100,
        repeat: -1,
        callback: () => {
          if (tint) {
            this.player.setTintFill(0xffffff)
            tint = 0
          } else {
            this.player.clearTint()
            tint = 1
          }
        },
      })
      this.cb1 = this.scene.time.addEvent({
        delay: 300,
        callback: () => {
          this.chargeSound.play()
        },
      })
      this.cb2 = this.scene.time.addEvent({
        delay: 1000,
        callback: () => {
          this.chargeSound.volume *= 1.5
          this.chargeSound.rate *= 1.5
        },
      })
      this.cb3 = this.scene.time.addEvent({
        delay: 2000,
        callback: () => {
          this.chargeSound.volume *= 1.5
          this.chargeSound.rate *= 1.5
        },
      })
    } else {
      this.player.direction.shoot = 1
    }
  }
  shootReleased() {
    // charge shot
    if (this.cb) {
      this.cb.remove()
      this.player.clearTint()
    }
    if (this.cb1) this.cb1.remove()
    if (this.cb2) this.cb2.remove()
    if (this.cb3) this.cb3.remove()
    this.chargeSound.volume = 0.5
    this.chargeSound.rate = 0.5
    if (this.player.unlocks.gun >= 3) {
      this.chargeSound.stop()
      this.player.direction.shoot = Math.max(
        1,
        Math.min(3, (+new Date() - this.shootTime) / 500),
      )
    } else {
      this.player.direction.shoot = 0
    }
  }

  missilePressed() {
    this.player.direction.missile = true
  }
  missileReleased() {
    this.player.direction.missile = false
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

  makeButton(x, y, key, callback, releaseCallback = () => {}, scale = 1) {
    return this.scene.add
      .image(x, y, 'tilemap', key)
      .setScale(scale)
      .setInteractive()
      .setScrollFactor(0)
      .setDepth(1000)
      .setAlpha(0.6)
      .on('pointerdown', callback)
      .on('pointerup', releaseCallback)
      .on('pointerout', releaseCallback)
  }

  update() {}
}
