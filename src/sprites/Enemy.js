export class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, object) {
    super(scene, object.x, object.y, 'tilemap')
    const frame = object.gid ? object.gid - 1 : 260
    this.setFrame(frame)
    this.scene = scene
    this.damage = this.damage.bind(this)
    this.scene.add.existing(this)
    this.scene.physics.world.enable(this)
    this.setSize(45, 25)
    this.setOffset(8, 35)
    this.health = 100
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

  damage(amount) {
    if (this.justDamaged) return
    this.justDamaged = true
    this.health -= amount
    this.setTintFill(0xffffff)
    if (this.health <= 0) {
      this.destroy()
      return
    }

    this.scene.time.addEvent({
      delay: 100,
      callback: () => {
        this.justDamaged = false
        this.clearTint()
      },
    })
  }

  destroy() {
    super.destroy()
    this.callback.remove()
  }
}
