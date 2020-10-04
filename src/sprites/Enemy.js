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
    this.setSize(8, 9)
    this.object = object
    this.setOffset(4, 8)
    this.health = 50
    this.spawned = false

    const props = object.properties || []
    const getPropValue = (n, defaultValue = 0) =>
      (props.find((p) => p.name === n) || { value: defaultValue }).value

    const typeFromProp = getPropValue('type', 0)
    this.type = +typeFromProp || +object.gid - 76

    this.setFrame(this.type + 75)

    this.delay = getPropValue('delay', 0)
    this.direction = getPropValue('direction', 1)
    this.baseSpeed = getPropValue('speed', 1)
  }

  doInit(vx = 0, vy = 0, gravity, delay, callback) {
    this.scene.time.addEvent({
      delay: 0,
      callback: () => {
        this.body.setGravityY(gravity)
        callback()
      },
    })
    this.setVelocity(vx, vy)
    this.callback = this.scene.time.addEvent({
      delay,
      repeat: -1,
      callback: () => {
        if (!this.active) {
          this.setVelocity(0)
          return
        }
        callback()
      },
    })
  }

  move() {
    if (this.spawned) return
    this.spawned = true
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
        if (this.scene.cameras.main.worldView.contains(this.x, this.y))
          this.scene.sound.play('jump', {
            rate: Phaser.Math.RND.between(4, 5) / 10,
            volume: 0.5,
          })
      })
      this.callback2 = this.scene.time.addEvent({
        delay: baseDelay * 1.9,
        repeat: -1,
        callback: () => (this.direction = this.direction === 1 ? -1 : 1),
      })
      // flipper
    } else if (this.type === 3) {
      this.doInit(0, -this.speed, 0, baseDelay, () => {
        this.setVelocityY(this.direction ? this.speed * 2 : -this.speed * 2)
        this.direction = this.direction ? 0 : 1
      })
      // ceiling jumper
    } else if (this.type === 4) {
      this.shouldStop = true
      this.flipY = true
      this.setOffset(1, -1)
      this.doInit(-this.speed, 0, -1000, baseDelay, () => {
        if (this.scene.cameras.main.worldView.contains(this.x, this.y))
          this.scene.sound.play('jump', {
            rate: Phaser.Math.RND.between(8, 10) / 10,
          })
        this.setVelocityX(this.speed * this.direction)
        this.setVelocityY(this.speed * 5)
      })
      this.callback2 = this.scene.time.addEvent({
        delay: baseDelay * 2.9,
        repeat: -1,
        callback: () => (this.direction = this.direction === 1 ? -1 : 1),
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
    const distToPlayer = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      this.scene.player.x,
      this.scene.player.y,
    )
    if (distToPlayer < 200) {
      this.setActive(true)
      if (!this.spawned) this.move()
    } else {
      this.setActive(false)
      this.x = this.object.x
      this.y = this.object.y - 8
    }
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
    const roll = Phaser.Math.RND.integerInRange(0, 10)
    if (
      roll >= 3 &&
      this.scene.level.player.health < this.scene.level.player.maxHealth
    ) {
      this.scene.level.coins.add(
        new ObjectSprite(this.scene, {
          x: this.x,
          y: this.y + 10,
          type: 'health',
          gid: 48,
        }),
      )
    } else if (roll >= 6 && this.scene.level.player.unlocks.ammo) {
      this.scene.level.coins.add(
        new ObjectSprite(this.scene, {
          x: this.x,
          y: this.y + 10,
          type: 'ammo',
          gid: 52,
        }),
      )
    }

    super.destroy()
    this.callback && this.callback.remove()
    this.callback2 && this.callback2.remove()
  }
}
