import { ObjectSprite } from './Object'

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, object) {
    super(scene, object.x, object.y, 'tilemap')
    const frame = object.gid ? object.gid - 1 : 260
    this.setFrame(frame)
    this.scene = scene
    this.damage = this.damage.bind(this)
    this.move = this.move.bind(this)
    this.destroy = this.destroy.bind(this)
    this.scene.add.existing(this)
    this.scene.physics.world.enable(this)
    this.setSize(45, 25)
    this.setOffset(8, 35)
    this.health = 100
    this.type = +object.name
    this.move(object.name)
  }

  move() {
    if (!this.type) this.type = 1
    // walker
    if (this.type === 1) {
      const speed = 200
      this.scene.time.addEvent({
        delay: 0,
        callback: () => {
          this.body.setGravityY(2000)
        },
      })
      this.scene.time.addEvent({
        delay: 1000,
        callback: () => {
          this.setVelocityX(-speed)
          this.callback = this.scene.time.addEvent({
            delay: 2000,
            repeat: -1,
            callback: () => {
              this.setVelocityX(this.body.velocity.x > 0 ? -speed : speed)
              this.setFlipX(this.body.velocity.x > 0)
            },
          })
        },
      })
      // jumper
    } else if (this.type === 2) {
      this.shouldStop = true
      this.scene.time.addEvent({
        delay: 0,
        callback: () => {
          this.body.setGravityY(2000)
        },
      })
      this.scene.time.addEvent({
        delay: 2000,
        repeat: -1,
        callback: () => {
          this.setVelocityX(100)
          this.setVelocityY(-700)
        },
      })
      // flipper
    } else if (this.type === 3) {
      let direction = 1
      this.scene.time.addEvent({
        delay: 500,
        repeat: -1,
        callback: () => {
          this.setVelocityY(direction ? 1000 : -1000)
          direction = direction ? 0 : 1
        },
      })
      // ceiling jumper
    } else if (this.type === 4) {
      this.shouldStop = true
      this.scene.time.addEvent({
        delay: 0,
        callback: () => {
          this.body.setGravityY(-2000)
        },
      })
      this.scene.time.addEvent({
        delay: 2000,
        repeat: -1,
        callback: () => {
          this.setVelocityX(-200)
          this.setVelocityY(700)
        },
      })
      // dasher
    } else if (this.type === 5) {
      this.scene.time.addEvent({
        delay: 0,
        callback: () => {
          this.body.setGravityY(2000)
        },
      })
      this.scene.time.addEvent({
        delay: 2000,
        repeat: -1,
        callback: () => {
          this.setVelocityX(800)
          this.scene.time.addEvent({
            delay: 200,
            callback: () => {
              this.setVelocityX(0)
            },
          })
        },
      })
      // flyer
    } else if (this.type === 7) {
      this.scene.time.addEvent({
        delay: 2000,
        repeat: -1,
        callback: () => {
          // TODO: needs to swoop
          this.setVelocityX(800)
          this.setVelocityY(400)
          this.scene.time.addEvent({
            delay: 200,
            callback: () => {
              this.setVelocityX(0)
              this.setVelocityY(0)
            },
          })
        },
      })
      // vertical crawler
    } else if (this.type === 8) {
      this.scene.time.addEvent({
        delay: 2000,
        repeat: -1,
        callback: () => {
          this.setVelocityY(this.body.velocity.y > 0 ? -200 : 200)
        },
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
    const roll = Phaser.Math.RND.integerInRange(0, 4)
    if (roll === 0) {
      this.scene.level.coins.add(
        new ObjectSprite(this.scene, {
          x: this.x,
          y: this.y + 10,
          type: 'health',
          gid: 374,
        }).setScale(0.5),
      )
    } else if (roll === 1) {
      this.scene.level.coins.add(
        new ObjectSprite(this.scene, {
          x: this.x,
          y: this.y + 10,
          type: 'ammo',
          gid: 377,
        }).setScale(0.5),
      )
    }

    super.destroy()
    this.callback.remove()
  }
}
