export class Spike extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, object) {
    super(scene, object.x, object.y - 16, 'tilemap', 3)
    this.overlap = this.overlap.bind(this)
    this.scene = scene
    this.scene.add.existing(this)
    this.scene.physics.world.enable(this)
    this.setSize(15, 8, false).setOrigin(0).setOffset(1, 8)
  }
  overlap(player) {
    player.damage(10)
  }
}
