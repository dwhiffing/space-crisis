import { Bullet } from './Bullet'

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, object) {
    super(scene, object.x, object.y, 'tilemap')
    this.scene = scene
    this.walk = this.walk.bind(this)
    this.stop = this.stop.bind(this)
    this.die = this.die.bind(this)
    this.jump = this.jump.bind(this)
    scene.add.existing(this)
    scene.physics.world.enable(this)
    this.body.setGravityY(500)
    this.direction = { left: false, right: false, up: false, down: false }

    this.type = object.name
    this.name = object.name
    this.canShoot = true
    this.canMove = true
    this.unlocks = {
      speed: 1,
      health: 1,
      ammo: 0,
      armor: 0,
      jump: 0, // short: 1, high: 2, double: 3
      gun: 0, // short: 1, long: 2, charge: 3, drill: 4
      win: 0,
    }
    this.jumpCount = 1

    this.body.setMaxVelocity(600, 600)
    this.body.useDamping = true
    this.setDrag(0.9, 1)
    this.setSize(14, 14)
    this.setOffset(1, 2)
    this.setDepth(2)
    this.setAlpha(1)

    this.particles = this.scene.add.particles('tilemap')
    this.jumpEmitter = this.particles
      .createEmitter({
        frame: 15,
        x: 0,
        y: 0,
        lifespan: { min: 300, max: 900 },
        speedX: { min: -30, max: 30 },
        speedY: { min: -20, max: 20 },
        angle: { min: 0, max: 360 },
        rotate: { min: 0, max: 360 },
        gravityY: -10,
        alpha: { start: 0.5, end: 0 },
        scale: { start: 0.2, end: 0 },
      })
      .stop()
    this.emitter = this.particles
      .createEmitter({
        frame: 15,
        x: 0,
        y: 0,
        lifespan: { min: 300, max: 900 },
        speedX: { min: -10, max: 10 },
        speedY: { min: -10, max: -2 },
        angle: { min: 0, max: 360 },
        rotate: { min: 0, max: 360 },
        gravityY: -20,
        alpha: { start: 0.5, end: 0 },
        scale: { start: 0.2, end: 0 },
        quantity: 1,
      })
      .stop()
      .setFrequency(300 - this.unlocks.speed * 100)

    this.speed = 60 + this.unlocks.speed * 30
    this.maxAmmo = this.unlocks.ammo * 5
    this.ammo = this.maxAmmo
    this.maxHealth = this.unlocks.health * 100
    this.health = this.maxHealth
    this.scene.ammoText.text = this.ammo.toString()
    this.scene.healthText.text = this.health.toString()

    this.bullets = scene.add.group({
      classType: Bullet,
      maxSize: 10,
      runChildUpdate: true,
    })

    scene.cameras.main.startFollow(this, true, 0.1, 0.1, 0, 20)

    scene.anims.create({
      key: `idle`,
      frameRate: 4,
      repeat: -1,
      frames: scene.anims.generateFrameNames('tilemap', {
        start: 153,
        end: 154,
      }),
    })
    this.walkAnim = scene.anims.create({
      key: `walk`,
      frameRate: this.unlocks.speed * 6,
      frames: scene.anims.generateFrameNames('tilemap', {
        start: 151,
        end: 152,
      }),
    })
    scene.anims.create({
      key: `jump`,
      frameRate: 5,
      frames: scene.anims.generateFrameNames('tilemap', {
        start: 155,
        end: 156,
      }),
    })
  }

  walk() {
    if (!this.canMove) return
    let speed = this.speed
    if (this.body.onFloor()) {
      if (!this.emitter.on) this.emitter.start()
      this.anims.play(`walk`, true)
    }
    if (
      this.body.onFloor() ||
      (this.body.velocity.x < speed && this.body.velocity.x > -speed)
    ) {
      const velo = this.direction.left
        ? -speed
        : this.direction.right
        ? speed
        : 0
      this.body.setVelocityX(velo)
    }

    this.flipX = this.direction.left
  }

  stop() {
    if (!this.canMove) return
    if (this.body.onFloor()) {
      if (this.emitter.on) this.emitter.stop()
      this.anims.play(`idle`, true)
    }
  }

  update() {
    this.emitter.setPosition(this.x + (this.flipX ? 2 : -2), this.y + 6)
    this.jumpEmitter.setPosition(this.x + (this.flipX ? 2 : -2), this.y + 6)
    if (this.body.onFloor()) {
      this.jumpCount = this.unlocks.jump >= 3 ? 2 : 1
    } else {
      this.emitter.stop()
      this.body.setAllowGravity(true)
    }
    if (!this.direction.left && !this.direction.right) {
      this.stop()
    } else {
      this.walk()
    }
    if (this.direction.shoot) {
      this.shoot(false, this.unlocks.gun >= 4 ? 3 : 1, this.direction.shoot)
    }
    if (this.direction.missile) {
      this.shoot(true)
    }
  }

  unlock(name) {
    if (name === 'win') {
      this.scene.scene.start('Win')
    } else {
      this.unlocks[name] = this.unlocks[name] || 0
      this.unlocks[name]++
    }

    if (name === 'speed') {
      this.speed = 60 + this.unlocks.speed * 30
      this.emitter.setFrequency(300 - this.unlocks.speed * 100)
      this.walkAnim.frameRate = this.unlocks.speed * 6
    }

    if (name === 'ammo') {
      this.maxAmmo = this.unlocks.ammo * 5
      this.reload(1000)
    }
    if (name === 'health') {
      this.maxHelth = this.unlocks.health * 100
      this.heal(1000)
    }
  }

  heal(amount) {
    this.health += amount
    if (this.health > this.maxHealth) {
      this.health = this.maxHealth
    }

    this.scene.healthText.text = this.health.toString()
  }

  reload(amount) {
    this.ammo += amount
    if (this.ammo > this.maxAmmo) {
      this.ammo = this.maxAmmo
    }

    this.scene.ammoText.text = this.ammo.toString()
  }

  jump(amount) {
    if (!this.canMove) return
    if (this.direction.down && this.canFall) {
      this.fall()
      return
    }
    if (this.jumpCount > 0) {
      this.jumpCount--
      this.jumpEmitter.explode(this.unlocks.jump * 20)
      this.anims.play(`jump`, true)

      let jumpHeight = this.unlocks.jump ? -240 : -5
      if (this.unlocks.jump >= 2) {
        jumpHeight *= 1.3
      }
      const diff = amount > 70 ? 1 : 0.65
      this.body.setVelocityY(jumpHeight * diff)
    }
  }

  fall() {
    if (this.body.onFloor() && this.canFall) {
      this.body.setVelocityY(20)
      this.scene.level.playerCollider.active = false
      this.scene.time.addEvent({
        delay: 200,
        callback: () => {
          this.scene.level.playerCollider.active = true
        },
      })
    }
  }

  damage(amount) {
    if (this.justDamaged) return
    this.justDamaged = true
    this.health -= amount
    this.setTintFill(0xffffff)
    if (this.health <= 0) {
      this.die()
    }

    this.scene.healthText.text = this.health.toString()
    this.setVelocity(this.flipX ? 100 : -100, -100)
    this.canMove = false
    this.scene.time.addEvent({
      delay: 250,
      callback: () => {
        this.canMove = true
        this.clearTint()
      },
    })
    this.scene.time.addEvent({
      delay: 1000,
      callback: () => {
        this.justDamaged = false
      },
    })
  }

  die() {
    this.scene.time.addEvent({
      delay: 500,
      callback: () => {
        this.scene.scene.start('Game')
      },
    })
  }

  shoot(isMissile, bulletCount = 1, charge = 1) {
    if (!this.canShoot || !this.unlocks.gun) return
    this.canShoot = false

    this.scene.time.addEvent({
      delay: 200,
      callback: () => {
        this.canShoot = true
      },
    })
    for (let i = bulletCount; i > 0; i--) {
      const bullet = this.bullets.get()
      const directionX =
        this.direction.up ||
        (this.direction.down && !(this.direction.left || this.direction.right))
          ? 0
          : this.flipX
          ? -1
          : 1

      let lifeSpan = 250
      if (bullet) {
        if (isMissile) {
          if (this.unlocks.ammo === 0) return
          if (this.ammo === 0) return
          this.ammo--
          this.scene.ammoText.text = this.ammo.toString()
          bullet.isMissile = true
          bullet.setSize(8, 8)
          lifeSpan = 1000
        } else {
          bullet.isMissile = false
          bullet.setSize(8, 8)
          bullet.setScale(1)
          if (this.unlocks.gun >= 2) {
            lifeSpan = 1000
          }
        }
        this.direction.shoot = 0

        bullet.fire(
          this.x,
          this.y + (bulletCount > 1 ? (i - 2) * 20 : 0),
          directionX,
          this.direction.up ? -1 : this.direction.down ? 1 : 0,
          lifeSpan,
        )
      }
    }
  }
}
