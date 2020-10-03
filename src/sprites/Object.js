export class ObjectSprite extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, object) {
    super(scene, object.x, object.y, 'tilemap')
    this.scene = scene
    this.type = object.type
    this.gid = object.gid
    this.scene.physics.world.enable(this)

    this.setCollideWorldBounds(true)
    this.isPressed = false
    this.setOrigin(0, 1)
    this.scene.add.existing(this)
    this.setFrame(this.gid - 1)

    setTimeout(() => {
      if (this.body && this.type === 'coin') {
        this.body.useDamping = true
        this.setSize(45, 40)
        this.setOffset(8, 20)
      }
    }, 0)
    this.overlap = this.overlap.bind(this)
  }

  overlap(player, callback) {
    if (this.type === 'coin') {
      this.destroy()
    }
  }
}
