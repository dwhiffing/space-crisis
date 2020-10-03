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

    this.body.setMaxVelocity(600, 1200)
    this.body.useDamping = true
    this.body.setSize(this.width, this.height - 8)
    this.setDrag(0.86, 1)
    this.setSize(58, 40)
    this.setOffset(3, 21)
    this.setDepth(2)
    this.setAlpha(1)
    this.health = 100

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
    const speed = this.body.onFloor() ? 450 : 350

    if (this.body.onFloor()) {
      this.anims.play(`walk`, true)
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
    this.body.useDamping = this.body.onFloor()
    if (!this.body.onFloor()) {
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
  }

  jump(amount) {
    if (this.direction.down && this.canFall) {
      this.fall()
      return
    }
    if (!this.canMove) return
    if (this.body.onFloor()) {
      this.anims.play(`jump`, true)
      const diff = amount > 70 ? 1 : 0.65
      this.body.setVelocityY(-950 * diff)
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

  shoot() {
    if (!this.canShoot) return
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

    if (bullet) {
      bullet.fire(
        this.x,
        this.y,
        directionX,
        this.direction.up ? -1 : this.direction.down ? 1 : 0,
      )
    }
  }
}
