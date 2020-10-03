export class Bullet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'exit')
    this.fire = this.fire.bind(this)
    this.setScale(0.5)
    scene.physics.world.enable(this)
    this.body.setAllowGravity(false)
    this.speed = 800
  }

  fire(x, y, directionX, directionY) {
    this.setPosition(x, y)
    this.startX = x
    this.setActive(true)
    this.setVisible(true)
    this.setVelocityX(this.speed * directionX)
    this.setVelocityY(
      (directionX === 0 ? this.speed : this.speed * 0.5) * directionY,
    )
  }

  update(time, delta) {
    if (Math.abs(this.x - this.startX) > 250) {
      this.destroy()
    }
  }

  destroy() {
    this.setActive(false)
    this.setVisible(false)
  }
}
