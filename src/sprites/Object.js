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
        this.setSize(15, 15)
        this.setOffset(1, 1)
      }
      if (this.body && this.type === 'upgrade') {
        this.setSize(15, 15)
        this.setOffset(1, 1)
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
      this.scene.sound.play('pickup')
      player.heal(20)
      this.destroy()
    }
    if (this.type === 'ammo') {
      this.scene.sound.play('pickup')
      player.reload(2)
      this.destroy()
    }
  }
}
