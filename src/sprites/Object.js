export class ObjectSprite extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, object) {
    super(scene, object.x, object.y, 'tilemap')
    this.overlap = this.overlap.bind(this)

    this.scene = scene
    this.type = object.type
    this.name = object.name
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
      if (this.body && this.type === 'upgrade') {
        this.setSize(45, 40)
        this.setOffset(8, 20)
      }
    }, 0)
  }

  overlap(player, callback) {
    if (this.type === 'coin') {
      this.destroy()
    }
    if (this.type === 'upgrade') {
      player.unlock(this.name)
      this.destroy()
    }
    if (this.type === 'health') {
      player.heal(10)
      this.destroy()
    }
    if (this.type === 'ammo') {
      player.reload(2)
      this.destroy()
    }
  }
}
