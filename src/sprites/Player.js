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
    this.direction = { left: false, right: false, up: false, down: false }

    this.type = object.name
    this.name = object.name
    this.canShoot = true
    this.canMove = true
    this.unlocks = {
      speed: 1,
      health: 1,
      ammo: 0,
      jump: 1,
      gun: 0,
      win: 0,
      doubleJump: 0,
      // 'charge',
      // 'armor',

      // 'longBeam', ?
      // 'wall jump', ?
      // 'drill', destroy tiles at will
    }
    this.jumpCount = 1

    this.body.setMaxVelocity(1500, 1300)
    this.body.useDamping = true
    this.body.setSize(this.width, this.height - 8)
    this.setDrag(0.81, 1)
    this.setSize(45, 40)
    this.setOffset(9, 21)
    this.setDepth(2)
    this.setAlpha(1)

    this.speed = 350 + this.unlocks.speed * 100
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

    const lastX = scene.cameras.main.scrollX
    const lastY = scene.cameras.main.scrollY
    scene.cameras.main.startFollow(this, true, 0.2, 0.2)
    scene.cameras.main.scrollX = lastX
    scene.cameras.main.scrollY = lastY

    scene.anims.create({
      key: `walk`,
      frameRate: 4,
      repeat: -1,
      frames: scene.anims.generateFrameNames('tilemap', { start: 81, end: 82 }),
    })
    scene.anims.create({
      key: `idle`,
      frameRate: 5,
      frames: scene.anims.generateFrameNames('tilemap', { start: 79, end: 80 }),
    })
    scene.anims.create({
      key: `jump`,
      frameRate: 5,
      frames: scene.anims.generateFrameNames('tilemap', { start: 83, end: 84 }),
    })
  }

  walk() {
    if (!this.canMove) return
    let speed = this.speed
    if (this.body.onFloor()) {
      this.anims.play(`walk`, true)
    } else {
      speed *= 0.8
    }
    if (
      this.body.onFloor() ||
      this.body.touching.down ||
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
      this.anims.play(`idle`, true)
    }
  }

  update() {
    if (this.body.onFloor()) {
      this.jumpCount = this.unlocks.doubleJump ? 2 : 1
    } else {
      this.body.setAllowGravity(true)
    }
    if (!this.direction.left && !this.direction.right) {
      this.stop()
    } else {
      this.walk()
    }
    if (this.direction.shoot) {
      this.shoot()
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
      this.anims.play(`jump`, true)

      let jumpHeight = this.unlocks.jump ? -880 : -300
      if (this.unlocks.jump === 2) {
        jumpHeight *= 1.4
      }
      const diff = amount > 70 ? 1 : 0.65
      this.body.setVelocityY(jumpHeight * diff)
    }
  }

  fall() {
    if (this.body.onFloor() && this.canFall) {
      this.body.setVelocityY(200)
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
    this.setVelocity(this.flipX ? 200 : -200, -200)
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
    this.scene.scene.start('Menu')
  }

  shoot(isMissile) {
    if (!this.canShoot || !this.unlocks.gun) return
    this.canShoot = false

    this.scene.time.addEvent({
      delay: 200,
      callback: () => {
        this.canShoot = true
      },
    })
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
      if (isMissile && this.unlocks.ammo > 0) {
        if (this.ammo === 0) return
        this.ammo--
        this.scene.ammoText.text = this.ammo.toString()
        bullet.setScale(1)
        lifeSpan = 1000
      } else {
        bullet.setScale(0.5)
      }

      bullet.fire(
        this.x,
        this.y,
        directionX,
        this.direction.up ? -1 : this.direction.down ? 1 : 0,
        lifeSpan,
      )
    }
  }
}
