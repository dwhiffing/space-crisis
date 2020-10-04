export class Spike extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, object) {
    super(scene, object.x, object.y - 60, 'tilemap', 4)
    this.overlap = this.overlap.bind(this)
    this.scene = scene
    this.scene.add.existing(this)
    this.scene.physics.world.enable(this)
    this.setSize(15, 15, false).setOrigin(0).setOffset(1, 1)
  }
  overlap(player) {
    player.damage(10)
  }
}
