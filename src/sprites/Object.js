export class ObjectSprite extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, object) {
    super(scene, object.x, object.y, 'tilemap')
    this.overlap = this.overlap.bind(this)

    this.scene = scene
    this.type = object.type
    this.gid = object.gid
    this.scene.physics.world.enable(this)
    this.scene.add.existing(this)

    this.setOrigin(0, 1)
    this.setFrame(this.gid - 1)

    setTimeout(() => {
      if (this.body && this.type === 'coin') {
        this.body.useDamping = true
        this.setSize(45, 40)
        this.setOffset(8, 20)
      }
    }, 0)
  }

  overlap(player, callback) {
    if (this.type === 'coin') {
      this.destroy()
    }
  }
}
