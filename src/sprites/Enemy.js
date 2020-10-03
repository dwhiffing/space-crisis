export class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, object) {
    super(scene, object.x, object.y, 'tilemap')
    this.setFrame(object.gid - 1)
    this.scene.add.existing(this)
    this.scene.physics.world.enable(this)
    const speed = 200
    scene.time.addEvent({
      delay: 1000,
      callback: () => {
        this.setVelocityX(-speed)
        this.callback = scene.time.addEvent({
          delay: 2000,
          repeat: -1,
          callback: () => {
            this.setVelocityX(this.body.velocity.x > 0 ? -speed : speed)
            this.setFlipX(this.body.velocity.x > 0)
          },
        })
      },
    })
  }

  destroy() {
    super.destroy()
    this.callback.remove()
  }
}
