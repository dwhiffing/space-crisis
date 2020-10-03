export class Bullet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'exit')
    this.fire = this.fire.bind(this)
    this.setScale(0.4)
  }

  fire(x, y, direction = 1) {
    this.setPosition(x, y)
    this.startX = x
    this.direction = direction
    this.setActive(true)
    this.setVisible(true)
  }

  update(time, delta) {
    this.x -= 10 * this.direction
    console.log(Math.abs(this.x - this.startX))
    if (Math.abs(this.x - this.startX) > 250) {
      this.setActive(false)
      this.setVisible(false)
    }
  }
}
