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
    this.name = 'player'
    this.canShoot = true
    this.canMove = true
    this.unlocks = {
      speed: 1,
      health: 1,
      ammo: 0,
      armor: 0,
      jump: 0, // short: 1, high: 2, double: 3
      gun: 0, // short: 1, long: 2, charge: 3
      bossKey: 0,
      win: 0,
    }
    this.jumpCount = 1

    this.gun = this.scene.add
      .image(this.x, this.y, 'tilemap', 52)
      .setDepth(99)
      .setAlpha(0)

    this.body.setMaxVelocity(600, 600)
    this.body.useDamping = true
    this.setDrag(0.8, 1)
    this.setSize(7, 11)
    this.setOffset(5, 5)
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

    this.speed = 60 + this.unlocks.speed * 30
    this.maxAmmo = this.unlocks.ammo * 10
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

    scene.cameras.main.startFollow(this, true, 0.1, 0.1, 0, 5)

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
      if (!this.emitter.on) {
        this.emitter.flow(300 - this.unlocks.speed * 100)
        if (!this.runSoundCallback) {
          this.runSoundCallback = this.scene.time.addEvent({
            delay: 500 - 120 * this.unlocks.speed,
            repeat: -1,
            callback: () => {
              this.scene.sound.play('hit2', {
                rate: Phaser.Math.RND.between(3, 6) / 10,
                volume: 0.2,
              })
            },
          })
        }
      }
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
      this.emitter.stop()
      this.anims.play(`idle`, true)
    }
  }

  update() {
    this.emitter.setPosition(this.x + (this.flipX ? 2 : -2), this.y + 6)
    this.jumpEmitter.setPosition(this.x + (this.flipX ? 2 : -2), this.y + 6)
    if (!this.body) return
    if (!this.body.onFloor()) {
      this.inAir = true
    }

    if (!this.body.onFloor() && this.emitter.on) this.emitter.stop()

    if (this.body.onFloor() && this.inAir) {
      this.inAir = false
      this.jumpCount = this.unlocks.jump >= 3 ? 2 : 1
      this.jumpEmitter.explode(20)
      this.scene.sound.play('hit2', {
        rate: Phaser.Math.RND.between(9, 10) / 10,
        volume: 0.5,
      })
    } else {
      this.body.setAllowGravity(true)
    }
    this.gun.setPosition(this.x + (this.flipX ? -5 : 5), this.y + 3)
    this.gun.flipX = this.flipX
    if (!this.direction.left && !this.direction.right) {
      this.runSoundCallback && this.runSoundCallback.remove()
      this.runSoundCallback = null
      this.stop()
    } else {
      this.walk()
    }
    if (this.direction.shoot) {
      this.shoot(false, 1, this.direction.shoot)
    }
    if (this.direction.missile) {
      this.shoot(true)
    }
  }

  unlock(name) {
    if (name === 'win') {
      this.scene.sound.muted = true
      this.scene.scene.start('Win')
    } else {
      this.unlocks[name] = this.unlocks[name] || 0
      this.unlocks[name]++
    }

    if (name === 'speed') {
      this.speed = 60 + this.unlocks.speed * 30
      this.walkAnim.frameRate = this.unlocks.speed * 6
    }

    if (name === 'gun') {
      this.scene.inputService.shootButton &&
        this.scene.inputService.shootButton.setAlpha(0.6)
      this.gun.setAlpha(1)
    }

    if (name === 'ammo') {
      this.scene.inputService.missileButton &&
        this.scene.inputService.missileButton.setAlpha(0.6)
      this.maxAmmo = this.unlocks.ammo * 10
      this.reload(1000)
    }
    if (name === 'health') {
      this.maxHealth = this.unlocks.health * 100
      this.heal(1000)
    }

    let upgradeText = name.toUpperCase()
    let extraText = ''
    if (name === 'ammo') {
      upgradeText = this.unlocks.ammo === 1 ? 'MISSILE' : 'MISSILE AMMO'
      extraText = this.unlocks.ammo === 1 ? 'X TO SHOOT' : ''
    }
    if (name === 'jump') {
      this.scene.inputService.jumpButton &&
        this.scene.inputService.jumpButton.setAlpha(0.6)
      upgradeText =
        this.unlocks.jump === 1
          ? 'JUMP'
          : this.unlocks.jump === 2
          ? 'JUMP HEIGHT'
          : 'DOUBLE JUMP'
      extraText =
        this.unlocks.jump === 1
          ? 'SPACE TO JUMP'
          : this.unlocks.jump === 2
          ? ''
          : ''
    }
    if (name === 'gun') {
      upgradeText =
        this.unlocks.gun === 1
          ? 'GUN'
          : this.unlocks.gun === 2
          ? 'LONG SHOT'
          : 'CHARGE GUN'
      extraText =
        this.unlocks.gun === 1
          ? 'Z TO SHOOT'
          : this.unlocks.gun === 2
          ? ''
          : 'Z TO CHARGE'
    }
    if (name === 'bossKey') {
      upgradeText = 'BOSS KEY'
      extraText = 'HURRY TO GREEN DOOR'
    }
    if (name === 'armor') {
      upgradeText = 'HEAT PROTECTION'
    }

    this.scene.sound.play('upgrade')

    this.scene.upgradeText.setText(`${upgradeText} UPGRADE ${extraText}`)
    this.scene.time.addEvent({
      delay: 6000,
      callback: () => this.scene.upgradeText.setText(''),
    })
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
    if (!this.unlocks.jump) {
      this.scene && this.scene.sound.play('not-available')
    }
    if (!this.canMove) return
    if (this.direction.down && this.canFall) {
      this.fall()
      return
    }
    if (this.jumpCount > 0) {
      this.jumpCount--
      // TODO: allow 3 levels of jump height
      this.jumpEmitter.explode(this.unlocks.jump * 20)
      if (this.unlocks.jump) {
        this.scene &&
          this.scene.sound.play('jump', {
            rate: Phaser.Math.RND.between(8, 10) / 10,
          })
      }
      if (this.anims) this.anims.play(`jump`, true)

      let jumpHeight = this.unlocks.jump ? -225 : -5
      if (this.unlocks.jump >= 2 && amount > 120) {
        jumpHeight *= 1.45
      }
      const diff = amount > 80 ? 1 : 0.65
      this.body && this.body.setVelocityY(jumpHeight * diff)
    }
  }

  fall() {
    if (this.body.onFloor() && this.canFall) {
      this.body.setVelocityY(20)
      this.scene.level.playerCollider.active = false
      this.scene.time.addEvent({
        delay: 400,
        callback: () => {
          this.scene.level.playerCollider.active = true
        },
      })
    }
  }

  damage(amount) {
    this.scene.cameras.main.shake(100, 0.015)
    if (this.justDamaged) return
    this.justDamaged = true
    this.health -= amount
    this.scene.sound.play('hit', {
      rate: Phaser.Math.RND.between(8, 10) / 10,
    })
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
    this.scene.cameras.main.shake(200, 0.02)
    this.scene.time.addEvent({
      delay: 500,
      callback: () => {
        this.scene.sound.muted = true
        this.scene.scene.restart()
        this.destroy()
      },
    })
  }

  shoot(isMissile, bulletCount = 1, charge = 1) {
    if (!this.canShoot) return
    this.canShoot = false

    this.scene.time.addEvent({
      delay: 200,
      callback: () => {
        this.canShoot = true
      },
    })
    if (!this.unlocks.gun) {
      this.scene.sound.play('not-available')
      return
    }
    for (let i = bulletCount; i > 0; i--) {
      const bullet = this.bullets.get()
      const directionX =
        this.direction.up ||
        (this.direction.down && !(this.direction.left || this.direction.right))
          ? 0
          : this.flipX
          ? -1
          : 1

      let lifeSpan = 50
      if (bullet) {
        if (isMissile) {
          if (!this.unlocks.ammo || this.ammo === 0) {
            this.scene.sound.play('not-available')
            this.canShoot = false
            return
          }
          this.ammo--
          this.scene.ammoText.text = this.ammo.toString()
          bullet.isMissile = true
          bullet.setSize(8, 8)
          lifeSpan = 200
          bullet.setFrame(49)
          this.scene.sound.play('missile', {
            rate: Phaser.Math.RND.between(8, 10) / 10,
          })
          bullet.damageAmount = 100
        } else {
          if (charge >= 2) {
            this.scene.sound.play('charge', {
              rate: Phaser.Math.RND.between(8, 10) / 10,
            })
            bullet.damageAmount = Math.round(charge) * 20
            bullet.setFrame(51)
          } else {
            bullet.setFrame(50)
            bullet.damageAmount = 10
            this.scene.sound.play('shoot', {
              rate: Phaser.Math.RND.between(8, 10) / 10,
            })
          }
          bullet.isMissile = false
          bullet.setSize(8, 8)
          bullet.setScale(1)
          if (this.unlocks.gun >= 2) {
            charge <= 1 && (bullet.damageAmount = 20)
            lifeSpan = 150
          }
        }
        this.direction.shoot = 0

        bullet.fire(
          this.x,
          this.y + (bulletCount > 1 ? (i - 2) * 20 : 2),
          directionX,
          this.direction.up ? -1 : this.direction.down ? 1 : 0,
          lifeSpan,
        )
      }
    }
  }
}
