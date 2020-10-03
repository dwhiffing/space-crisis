export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, object) {
    super(scene, object.x, object.y, 'tilemap')
    this.scene = scene
    this.walk = this.walk.bind(this)
    this.stop = this.stop.bind(this)
    this.action = this.action.bind(this)
    this.scene.add.existing(this)
    this.scene.physics.world.enable(this)
    this.body.setMaxVelocity(300, 600)
    this.setCollideWorldBounds(true)
    this.body.useDamping = true
    this.setDrag(0.86, 0.9)
    this.body.setSize(this.width, this.height - 8)
    this.setSize(58, 40)
    this.setOffset(3, 21)

    this.alpha = 1
    this.setDepth(2)

    const lastX = this.scene.cameras.main.scrollX
    const lastY = this.scene.cameras.main.scrollY
    this.scene.cameras.main.startFollow(this, true, 0.2, 0.2)
    this.scene.cameras.main.scrollX = lastX
    this.scene.cameras.main.scrollY = lastY
    this.anims.play(`idle`, true)

    this.type = object.name
    this.name = object.name
    this.scene.anims.create({
      key: `walk`,
      frames: this.scene.anims.generateFrameNames('tilemap', {
        start: 81,
        end: 82,
      }),
      frameRate: 4,
      repeat: -1,
    })
    this.scene.anims.create({
      key: `idle`,
      frames: this.scene.anims.generateFrameNames('tilemap', {
        start: 79,
        end: 80,
      }),
      frameRate: 5,
    })
    this.scene.anims.create({
      key: `jump`,
      frames: this.scene.anims.generateFrameNames('tilemap', {
        start: 83,
        end: 84,
      }),
      frameRate: 2,
    })
  }

  walk(x) {
    const baseSpeed = 200
    const speed =
      this.body.onFloor() || this.body.touching.down
        ? baseSpeed
        : baseSpeed * 0.3

    if (this.body.onFloor() || this.body.touching.down) {
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
    if (this.body.onFloor() || this.body.touching.down) {
      this.anims.play(`idle`, true)
    }
  }

  update() {
    this.body.useDamping = this.body.onFloor() || this.body.touching.down
    if (!this.body.onFloor()) {
      this.body.setAllowGravity(true)
    }
  }

  action() {
    if (this.body.onFloor() || this.body.touching.down) {
      this.anims.play(`jump`, true)
      this.body.setVelocityY(-400)
    }
  }
}
