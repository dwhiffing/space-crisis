export class Bullet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'tilemap', 50)
    this.fire = this.fire.bind(this)
    scene.physics.world.enable(this)
    this.body.setAllowGravity(false)
    this.speed = 300
  }

  fire(x, y, directionX, directionY, lifeSpan = 250) {
    this.setPosition(x, y)
    this.startX = x
    this.setActive(true)
    this.setVisible(true)
    this.setVelocityX(this.speed * directionX)
    this.lifeSpan = lifeSpan
    this.setVelocityY(
      (directionX === 0 ? this.speed : this.speed * 0.5) * directionY,
    )
  }

  update(time, delta) {
    if (Math.abs(this.x - this.startX) > this.lifeSpan) {
      this.destroy()
    }
  }

  destroy() {
    this.setActive(false)
    this.setVisible(false)
  }
}
