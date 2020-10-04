import { ObjectSprite } from './Object'

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, object) {
    super(scene, object.x, object.y - 8, 'tilemap')

    this.scene = scene
    this.damage = this.damage.bind(this)
    this.move = this.move.bind(this)
    this.destroy = this.destroy.bind(this)
    this.doInit = this.doInit.bind(this)
    this.scene.add.existing(this)
    this.scene.physics.world.enable(this)
    this.setSize(15, 9)
    this.setOffset(1, 8)
    this.health = 50

    const props = object.properties || []
    const getPropValue = (n, defaultValue = 0) =>
      (props.find((p) => p.name === n) || { value: defaultValue }).value

    const typeFromProp = getPropValue('type', 0)
    this.type = +typeFromProp || +object.gid - 76

    this.setFrame(this.type + 75)

    this.delay = getPropValue('delay', 0)
    this.direction = getPropValue('direction', 1)
    this.baseSpeed = getPropValue('speed', 1)

    // TODO: need to handle turning logic for various enemies

    this.move(object.name)
  }

  doInit(vx, vy, gravity, delay, callback) {
    this.scene.time.addEvent({
      delay: 0,
      callback: () => {
        this.body.setGravityY(gravity)
        callback()
      },
    })
    this.setVelocity(vx, vy)
    this.callback = this.scene.time.addEvent({ delay, repeat: -1, callback })
  }

  move() {
    this.speed = 50 * this.baseSpeed
    const baseDelay = 1000 + this.delay * 500

    if (!this.type) this.type = 1
    // walker
    if (this.type === 1) {
      this.doInit(-this.speed, 0, 0, baseDelay, () => {
        this.setVelocityX(this.speed * this.direction)
        this.setFlipX(this.direction === 1)
        this.direction = this.direction === 1 ? -1 : 1
      })
      // jumper
    } else if (this.type === 2) {
      this.shouldStop = true
      this.doInit(-this.speed, 0, 800, baseDelay, () => {
        this.velo = this.speed * 2
        this.setVelocityX(this.speed * 2 * this.direction)
        this.setVelocityY(this.speed * -5)
        this.scene.sound.play('jump', {
          rate: Phaser.Math.RND.between(4, 5) / 10,
          volume: 0.5,
        })
      })
      this.callback2 = this.scene.time.addEvent({
        delay: baseDelay * 3,
        repeat: -1,
        callback: () => this.setVelocityX(this.velo * -1),
      })
      // flipper
    } else if (this.type === 3) {
      this.doInit(-this.speed, 0, 0, baseDelay, () => {
        this.setVelocityY(this.direction ? this.speed * 2 : -this.speed * 2)
        this.direction = this.direction ? 0 : 1
      })
      // ceiling jumper
    } else if (this.type === 4) {
      this.shouldStop = true
      this.flipY = true
      this.setOffset(1, -1)
      this.doInit(-this.speed, 0, -1000, baseDelay, () => {
        this.scene.sound.play('jump', {
          rate: Phaser.Math.RND.between(8, 10) / 10,
        })
        this.setVelocityX(this.speed * this.direction)
        this.setVelocityY(this.speed * 2)
      })
      // dasher
    } else if (this.type === 5) {
      this.doInit(-this.speed, 0, 1000, baseDelay, () => {
        this.setVelocityX(this.speed * 3)
        this.callback2 = this.scene.time.addEvent({
          delay: 200,
          callback: () => this.setVelocityX(0),
        })
      })
      // flyer TODO
    } else if (this.type === 6) {
      // TODO
      // vertical crawler
    } else if (this.type === 7) {
      this.doInit(0, -this.speed, 0, baseDelay, () => {
        this.direction = this.direction === 1 ? 0 : 1
        this.setVelocityY(this.direction ? -this.speed : this.speed)
      })
    }
  }

  update() {
    if (
      this.shouldStop &&
      (this.body.onFloor() || this.body.onCeiling()) &&
      this.body.velocity.x !== 0
    ) {
      this.setVelocityX(0)
    }
  }

  damage(amount) {
    if (this.justDamaged) return
    this.justDamaged = true
    this.health -= amount
    this.setTintFill(0xffffff)
    if (this.health <= 0) {
      this.destroy()
      return
    }

    this.scene.time.addEvent({
      delay: 100,
      callback: () => {
        this.justDamaged = false
        this.clearTint()
      },
    })
  }

  destroy() {
    if (!this.scene) return
    this.scene.sound.play('enemyDead')
    const roll = Phaser.Math.RND.integerInRange(0, 4)
    if (roll === 0) {
      this.scene.level.coins.add(
        new ObjectSprite(this.scene, {
          x: this.x,
          y: this.y + 10,
          type: 'health',
          gid: 47,
        }),
      )
    } else if (roll === 1) {
      this.scene.level.coins.add(
        new ObjectSprite(this.scene, {
          x: this.x,
          y: this.y + 10,
          type: 'ammo',
          gid: 46,
        }),
      )
    }

    super.destroy()
    this.callback && this.callback.remove()
    this.callback2 && this.callback2.remove()
  }
}
