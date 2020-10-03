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

    this.type = object.name
    this.name = object.name

    this.body.setMaxVelocity(300, 600)
    this.body.useDamping = true
    this.body.setSize(this.width, this.height - 8)
    this.setDrag(0.86, 0.9)
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
      frameRate: 2,
      frames: scene.anims.generateFrameNames('tilemap', { start: 83, end: 84 }),
    })
  }

  walk(x) {
    if (this.justDamaged) return
    const speed = this.body.onFloor() ? 350 : 100

    if (this.body.onFloor()) {
      this.anims.play(`walk`, true)
    }
    if (
      this.body.onFloor() ||
      this.body.touching.down ||
      (this.body.velocity.x < speed && this.body.velocity.x > -speed)
    ) {
      this.body.setVelocityX(x * speed)
    }
    this.flipX = x < 0
  }

  stop() {
    if (this.justDamaged) return
    if (this.body.onFloor()) {
      this.anims.play(`idle`, true)
    }
  }

  update() {
    this.body.useDamping = this.body.onFloor()
    if (!this.body.onFloor()) {
      this.body.setAllowGravity(true)
    }
  }

  jump() {
    if (this.justDamaged) return
    if (this.body.onFloor()) {
      this.anims.play(`jump`, true)
      this.body.setVelocityY(-600)
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
    this.scene.time.addEvent({
      delay: 500,
      callback: () => {
        this.justDamaged = false
        this.clearTint()
      },
    })
  }

  die() {
    this.scene.scene.start('Menu')
  }

  shoot() {
    const bullet = this.bullets.get()

    if (bullet) {
      bullet.fire(this.x, this.y, this.flipX ? 1 : -1)
    }
  }
}
