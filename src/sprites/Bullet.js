export class Bullet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'tilemap', 50)
    this.fire = this.fire.bind(this)
    scene.physics.world.enable(this)
    this.body.setAllowGravity(false)
    this.speed = 160
    this.damageAmount = 10

    this.particles = this.scene.add.particles('tilemap')
    this.emitter = this.particles
      .createEmitter({
        frame: 15,
        x: 0,
        y: 0,
        lifespan: { min: 300, max: 900 },
        speedX: { min: -40, max: 40 },
        speedY: { min: -40, max: 40 },
        angle: { min: 0, max: 360 },
        rotate: { min: 0, max: 360 },
        gravityY: -0,
        alpha: { start: 0.5, end: 0 },
        scale: { start: 0.3, end: 0 },
        quantity: 1,
      })
      .stop()
  }

  fire(x, y, directionX, directionY, lifeSpan = 250) {
    this.setPosition(x, y)
    this.startX = x
    this.setActive(true)
    this.setVisible(true)
    this.setVelocityX(this.speed * directionX)
    if (this.isMissile) {
      this.emitter.start()
      this.emitter.flow(50)
    }
    this.lifeSpan = lifeSpan
    this.setVelocityY(
      (directionX === 0 ? this.speed : this.speed * 0.5) * directionY,
    )
  }

  update(time, delta) {
    this.emitter.setPosition(this.x, this.y)
    if (Math.abs(this.x - this.startX) > this.lifeSpan) {
      this.destroy(false)
    }
  }

  destroy(useSound = true) {
    if (this.isMissile) {
      this.emitter.explode(20)
      this.scene.cameras.main.shake(100, 0.015)
      this.scene.sound.play('missile-explode', {
        rate: Phaser.Math.RND.between(8, 10) / 10,
        volume: 2,
      })
    } else {
      this.emitter.explode(1)
      useSound &&
        this.scene.sound.play('hit', {
          rate: Phaser.Math.RND.between(15, 20) / 10,
          volume: 0.5,
        })
    }
    this.setActive(false)
    this.setVisible(false)
  }
}
